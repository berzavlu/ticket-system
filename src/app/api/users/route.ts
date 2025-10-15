import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { requireRole, Permission, hasPermission } from '@/lib/permissions';

// GET /api/users - Listar usuarios (ADMIN y SUPERVISOR)
export async function GET(request: NextRequest) {
  try {
    // Solo ADMIN y SUPERVISOR pueden ver usuarios
    const user = await requireRole(['ADMIN', 'SUPERVISOR']);
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const active = searchParams.get('active');

    const where: any = {};
    if (role) where.role = role;
    if (active !== null) where.active = active === 'true';

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
        createdAt: true,
        _count: {
          select: {
            assignedTickets: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      data: users,
      count: users.length,
    });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    const status = error.message?.includes('sesión') ? 401 : 
                   error.message?.includes('permisos') ? 403 : 500;
    return NextResponse.json(
      { success: false, error: error.message || 'Error al obtener los usuarios' },
      { status }
    );
  }
}

// POST /api/users - Crear usuario (solo ADMIN)
export async function POST(request: NextRequest) {
  try {
    // Solo ADMIN puede crear usuarios
    await requireRole(['ADMIN']);
    const body = await request.json();
    const { email, name, password, role } = body;

    // Validaciones
    if (!email || !name || !password) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Campos requeridos: email, name, password' 
        },
        { status: 400 }
      );
    }

    // Verificar si el email ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'El email ya está registrado' },
        { status: 400 }
      );
    }

    // Hash del password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: role || 'AGENT',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: user,
        message: 'Usuario creado exitosamente',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating user:', error);
    const status = error.message?.includes('sesión') ? 401 : 
                   error.message?.includes('permisos') ? 403 : 500;
    return NextResponse.json(
      { success: false, error: error.message || 'Error al crear el usuario' },
      { status }
    );
  }
}