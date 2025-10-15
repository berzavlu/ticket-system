import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/permissions';

// GET /api/customers - Listar clientes (ADMIN, SUPERVISOR, AGENT)
export async function GET(request: NextRequest) {
  try {
    // Solo usuarios con permisos pueden ver clientes
    await requireRole(['ADMIN', 'SUPERVISOR', 'AGENT']);
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    const where: any = {};
    
    // Búsqueda por nombre o email
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
      ];
    }

    const customers = await prisma.customer.findMany({
      where,
      include: {
        _count: {
          select: {
            tickets: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: customers,
      count: customers.length,
    });
  } catch (error: any) {
    console.error('Error fetching customers:', error);
    const status = error.message?.includes('sesión') ? 401 : 
                   error.message?.includes('permisos') ? 403 : 500;
    return NextResponse.json(
      { success: false, error: error.message || 'Error al obtener los clientes' },
      { status }
    );
  }
}

// POST /api/customers - Crear cliente (ADMIN, SUPERVISOR, AGENT)
export async function POST(request: NextRequest) {
  try {
    // Solo usuarios con permisos pueden crear clientes
    await requireRole(['ADMIN', 'SUPERVISOR', 'AGENT']);
    
    const body = await request.json();
    const { name, email, phone, company } = body;

    // Validaciones
    if (!name || !email) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Campos requeridos: name, email' 
        },
        { status: 400 }
      );
    }

    // Verificar si el email ya existe
    const existingCustomer = await prisma.customer.findUnique({
      where: { email },
    });

    if (existingCustomer) {
      return NextResponse.json(
        { success: false, error: 'El email ya está registrado' },
        { status: 400 }
      );
    }

    // Crear cliente
    const customer = await prisma.customer.create({
      data: {
        name,
        email,
        phone: phone || null,
        company: company || null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: customer,
        message: 'Cliente creado exitosamente',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating customer:', error);
    const status = error.message?.includes('sesión') ? 401 : 
                   error.message?.includes('permisos') ? 403 : 500;
    return NextResponse.json(
      { success: false, error: error.message || 'Error al crear el cliente' },
      { status }
    );
  }
}

