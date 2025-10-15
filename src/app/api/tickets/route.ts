import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth, getTicketFilter, Permission, hasPermission } from '@/lib/permissions';
import { Role } from '@prisma/client';

// GET /api/tickets - Listar tickets según permisos del usuario
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const user = await requireAuth();
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const assignedToId = searchParams.get('assignedToId');
    const priority = searchParams.get('priority');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    // Obtener filtro base según el rol del usuario
    const baseFilter = await getTicketFilter();
    
    if (!baseFilter) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 403 }
      );
    }

    // Agregar filtros adicionales
    const where: any = { ...baseFilter };
    if (status) where.status = status;
    if (priority) where.priority = priority;
    
    // Filtro de agente asignado
    if (assignedToId) {
      if (assignedToId === 'unassigned') {
        where.assignedToId = null;
      } else {
        where.assignedToId = assignedToId;
      }
    }
    
    // Filtros de fecha
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        // Agregar 23:59:59 al final del día
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        where.createdAt.lte = endDate;
      }
    }

    const tickets = await prisma.ticket.findMany({
      where,
      include: {
        customer: true,
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        responses: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: tickets,
      count: tickets.length,
    });
  } catch (error: any) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al obtener los tickets' },
      { status: error.message?.includes('sesión') ? 401 : 500 }
    );
  }
}

// POST /api/tickets - Crear nuevo ticket
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const user = await requireAuth();
    
    // Verificar permiso para crear tickets
    if (!hasPermission(user.role, Permission.CREATE_TICKET)) {
      return NextResponse.json(
        { success: false, error: 'No tiene permisos para crear tickets' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      category,
      priority,
      source,
      customer,
      assignedToId,
    } = body;

    // Validaciones básicas
    if (!title || !description) {
      return NextResponse.json(
        { success: false, error: 'Campos requeridos: title, description' },
        { status: 400 }
      );
    }

    let customerRecord;

    // Si es un cliente autenticado, usar su información
    if (user.role === Role.CUSTOMER) {
      // Buscar si ya existe un customer vinculado a este usuario
      customerRecord = await prisma.customer.findFirst({
        where: { email: user.email },
      });

      if (!customerRecord) {
        // Crear registro de cliente vinculado al usuario
        customerRecord = await prisma.customer.create({
          data: {
            name: user.name || 'Cliente',
            email: user.email,
          },
        });
      }
    } else {
      // Para admin/supervisor/agent, usar datos del cliente proporcionado
      if (!customer || !customer.email) {
        return NextResponse.json(
          { success: false, error: 'Información del cliente requerida' },
          { status: 400 }
        );
      }

      // Crear o encontrar cliente
      customerRecord = await prisma.customer.findFirst({
        where: { email: customer.email },
      });

      if (!customerRecord) {
        customerRecord = await prisma.customer.create({
          data: {
            name: customer.name,
            email: customer.email,
            phone: customer.phone || null,
            company: customer.company || null,
          },
        });
      }
    }

    // Solo ADMIN y SUPERVISOR pueden asignar tickets
    const canAssign = hasPermission(user.role, Permission.ASSIGN_TICKET);
    const finalAssignedToId = canAssign ? (assignedToId || null) : null;

    // Crear ticket
    const ticket = await prisma.ticket.create({
      data: {
        title,
        description,
        category: category || 'GENERAL',
        priority: priority || 'MEDIUM',
        source: source || 'WEB_FORM',
        status: 'OPEN',
        customerId: customerRecord.id,
        assignedToId: finalAssignedToId,
        assignedAt: finalAssignedToId ? new Date() : null,
      },
      include: {
        customer: true,
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: ticket,
        message: 'Ticket creado exitosamente',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating ticket:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al crear el ticket' },
      { status: error.message?.includes('sesión') ? 401 : 500 }
    );
  }
}