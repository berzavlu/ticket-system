import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth, canAccessTicket } from '@/lib/permissions';

// GET /api/tickets/[id] - Obtener ticket por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticación
    const user = await requireAuth();
    
    // Verificar que el usuario pueda acceder a este ticket
    const hasAccess = await canAccessTicket(params.id);
    
    if (!hasAccess) {
      return NextResponse.json(
        { success: false, error: 'No tiene permisos para acceder a este ticket' },
        { status: 403 }
      );
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id: params.id },
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
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json(
        { success: false, error: 'Ticket no encontrado' },
        { status: 404 }
      );
    }

    // Filtrar respuestas internas si es un cliente
    if (user.role === ('CUSTOMER' as any)) {
      ticket.responses = ticket.responses.filter((r: any) => !r.isInternal);
    }

    return NextResponse.json({
      success: true,
      data: ticket,
    });
  } catch (error: any) {
    console.error('Error fetching ticket:', error);
    const status = error.message?.includes('sesión') ? 401 : 
                   error.message?.includes('permisos') ? 403 : 500;
    return NextResponse.json(
      { success: false, error: error.message || 'Error al obtener el ticket' },
      { status }
    );
  }
}

// PUT /api/tickets/[id] - Actualizar ticket
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticación
    const user = await requireAuth();
    
    // Verificar que el usuario pueda acceder a este ticket
    const hasAccess = await canAccessTicket(params.id);
    
    if (!hasAccess) {
      return NextResponse.json(
        { success: false, error: 'No tiene permisos para acceder a este ticket' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { status, priority, assignedToId, title, description, category } = body;

    const updateData: any = {};
    
    // Solo staff puede actualizar tickets
    if (user.role === ('CUSTOMER' as any)) {
      return NextResponse.json(
        { success: false, error: 'Los clientes no pueden actualizar tickets directamente' },
        { status: 403 }
      );
    }
    
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (category) updateData.category = category;
    if (priority) updateData.priority = priority;
    if (status) {
      updateData.status = status;
      if (status === 'CLOSED' || status === 'RESOLVED') {
        updateData.closedAt = new Date();
      }
    }
    if (assignedToId !== undefined) {
      // AGENT solo puede asignarse tickets a sí mismo
      if (user.role === 'AGENT') {
        // Verificar que está intentando asignarse a sí mismo
        if (assignedToId !== user.id && assignedToId !== null) {
          return NextResponse.json(
            { success: false, error: 'Los agentes solo pueden asignarse tickets a sí mismos' },
            { status: 403 }
          );
        }
        // Verificar que el ticket esté abierto y sin asignar
        const currentTicket = await prisma.ticket.findUnique({
          where: { id: params.id },
          select: { status: true, assignedToId: true },
        });
        
        if (!currentTicket) {
          return NextResponse.json(
            { success: false, error: 'Ticket no encontrado' },
            { status: 404 }
          );
        }
        
        // Solo puede asignar si el ticket está abierto y sin asignar
        if (assignedToId && (currentTicket.status !== 'OPEN' || currentTicket.assignedToId !== null)) {
          return NextResponse.json(
            { success: false, error: 'Solo puedes asignarte tickets abiertos que no estén asignados' },
            { status: 403 }
          );
        }
      }
      
      updateData.assignedToId = assignedToId;
      if (assignedToId) {
        updateData.assignedAt = new Date();
        if (updateData.status === undefined) {
          updateData.status = 'IN_PROGRESS';
        }
      }
    }

    const ticket = await prisma.ticket.update({
      where: { id: params.id },
      data: updateData,
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

    return NextResponse.json({
      success: true,
      data: ticket,
      message: 'Ticket actualizado exitosamente',
    });
  } catch (error: any) {
    console.error('Error updating ticket:', error);
    const status = error.message?.includes('sesión') ? 401 : 
                   error.message?.includes('permisos') ? 403 : 500;
    return NextResponse.json(
      { success: false, error: error.message || 'Error al actualizar el ticket' },
      { status }
    );
  }
}

// DELETE /api/tickets/[id] - Eliminar ticket (solo ADMIN)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticación y rol ADMIN
    const user = await requireAuth();
    
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Solo administradores pueden eliminar tickets' },
        { status: 403 }
      );
    }

    await prisma.ticket.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Ticket eliminado exitosamente',
    });
  } catch (error: any) {
    console.error('Error deleting ticket:', error);
    const status = error.message?.includes('sesión') ? 401 : 
                   error.message?.includes('permisos') ? 403 : 500;
    return NextResponse.json(
      { success: false, error: error.message || 'Error al eliminar el ticket' },
      { status }
    );
  }
}