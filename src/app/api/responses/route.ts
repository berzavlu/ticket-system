import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth, canAccessTicket, Permission, hasPermission } from '@/lib/permissions';
import { sendTicketResponseEmail } from '@/lib/email';

// POST /api/responses - Agregar respuesta a un ticket
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const user = await requireAuth();
    
    const body = await request.json();
    const { ticketId, message, isInternal } = body;

    // Validaciones
    if (!ticketId || !message) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Campos requeridos: ticketId, message' 
        },
        { status: 400 }
      );
    }

    // Verificar que el ticket existe y obtener información del cliente
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        customer: true,
      },
    });

    if (!ticket) {
      return NextResponse.json(
        { success: false, error: 'Ticket no encontrado' },
        { status: 404 }
      );
    }

    // Verificar que el ticket no esté cerrado
    if (ticket.status === 'CLOSED' || ticket.status === 'RESOLVED') {
      return NextResponse.json(
        { success: false, error: 'No se pueden agregar respuestas a tickets cerrados o resueltos' },
        { status: 400 }
      );
    }

    // Verificar que el usuario puede acceder al ticket
    const hasAccess = await canAccessTicket(ticketId);
    if (!hasAccess) {
      return NextResponse.json(
        { success: false, error: 'No tiene permisos para acceder a este ticket' },
        { status: 403 }
      );
    }

    // Verificar permiso para crear respuestas
    if (!hasPermission(user.role, Permission.CREATE_RESPONSE)) {
      return NextResponse.json(
        { success: false, error: 'No tiene permisos para responder tickets' },
        { status: 403 }
      );
    }

    // Solo staff puede crear notas internas
    const canCreateInternal = user.role !== 'CUSTOMER';
    const finalIsInternal = canCreateInternal && isInternal ? true : false;

    // Crear la respuesta
    const response = await prisma.response.create({
      data: {
        ticketId,
        userId: user.id,
        message,
        isInternal: finalIsInternal,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Actualizar el estado del ticket si estaba OPEN
    if (ticket.status === 'OPEN') {
      await prisma.ticket.update({
        where: { id: ticketId },
        data: { status: 'IN_PROGRESS' },
      });
    }

    // Enviar notificación por correo al cliente si no es una nota interna
    // y quien responde no es el cliente
    if (!finalIsInternal && user.role !== 'CUSTOMER' && ticket.customer) {
      // Enviar email de forma asíncrona (no bloquear la respuesta)
      sendTicketResponseEmail({
        customerEmail: ticket.customer.email,
        customerName: ticket.customer.name,
        ticketTitle: ticket.title,
        ticketId: ticket.id,
        agentName: response.user.name || 'El equipo de soporte',
        responseMessage: message,
      }).catch(error => {
        // Solo loguear el error sin fallar la operación
        console.error('Error al enviar notificación por email:', error);
      });
    }

    return NextResponse.json(
      {
        success: true,
        data: response,
        message: 'Respuesta agregada exitosamente',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating response:', error);
    const status = error.message?.includes('sesión') ? 401 : 
                   error.message?.includes('permisos') ? 403 : 500;
    return NextResponse.json(
      { success: false, error: error.message || 'Error al crear la respuesta' },
      { status }
    );
  }
}

// GET /api/responses?ticketId=xxx - Obtener respuestas de un ticket
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const user = await requireAuth();
    
    const { searchParams } = new URL(request.url);
    const ticketId = searchParams.get('ticketId');

    if (!ticketId) {
      return NextResponse.json(
        { success: false, error: 'ticketId es requerido' },
        { status: 400 }
      );
    }

    // Verificar que el usuario puede acceder al ticket
    const hasAccess = await canAccessTicket(ticketId);
    if (!hasAccess) {
      return NextResponse.json(
        { success: false, error: 'No tiene permisos para acceder a este ticket' },
        { status: 403 }
      );
    }

    // Clientes no pueden ver notas internas
    const whereClause: any = { ticketId };
    if (user.role === 'CUSTOMER') {
      whereClause.isInternal = false;
    }

    const responses = await prisma.response.findMany({
      where: whereClause,
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
    });

    return NextResponse.json({
      success: true,
      data: responses,
      count: responses.length,
    });
  } catch (error: any) {
    console.error('Error fetching responses:', error);
    const status = error.message?.includes('sesión') ? 401 : 
                   error.message?.includes('permisos') ? 403 : 500;
    return NextResponse.json(
      { success: false, error: error.message || 'Error al obtener las respuestas' },
      { status }
    );
  }
}