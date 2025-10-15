import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/permissions';

// GET /api/users/[id] - Obtener perfil de usuario con estadísticas
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Solo ADMIN y SUPERVISOR pueden ver detalles de usuarios
    await requireRole(['ADMIN', 'SUPERVISOR']);

    // Await params en Next.js 15
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        assignedTickets: {
          include: {
            customer: true,
            responses: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        responses: {
          include: {
            ticket: {
              include: {
                customer: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10, // Últimas 10 respuestas
        },
        _count: {
          select: {
            assignedTickets: true,
            responses: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Calcular estadísticas de tickets
    const ticketStats = {
      total: user.assignedTickets.length,
      open: user.assignedTickets.filter((t) => t.status === 'OPEN').length,
      inProgress: user.assignedTickets.filter((t) => t.status === 'IN_PROGRESS').length,
      pending: user.assignedTickets.filter((t) => t.status === 'PENDING').length,
      resolved: user.assignedTickets.filter((t) => t.status === 'RESOLVED').length,
      closed: user.assignedTickets.filter((t) => t.status === 'CLOSED').length,
    };

    // Calcular estadísticas de prioridad
    const priorityStats = {
      low: user.assignedTickets.filter((t) => t.priority === 'LOW').length,
      medium: user.assignedTickets.filter((t) => t.priority === 'MEDIUM').length,
      high: user.assignedTickets.filter((t) => t.priority === 'HIGH').length,
      urgent: user.assignedTickets.filter((t) => t.priority === 'URGENT').length,
    };

    // Calcular tiempo promedio de respuesta (en horas)
    const ticketsWithResponses = user.assignedTickets.filter(
      (t) => t.responses && t.responses.length > 0
    );
    
    let avgResponseTime = 0;
    if (ticketsWithResponses.length > 0) {
      const totalResponseTime = ticketsWithResponses.reduce((acc, ticket) => {
        const firstResponse = ticket.responses?.[0];
        if (firstResponse) {
          const diff = new Date(firstResponse.createdAt).getTime() - new Date(ticket.createdAt).getTime();
          return acc + diff;
        }
        return acc;
      }, 0);
      avgResponseTime = totalResponseTime / ticketsWithResponses.length / (1000 * 60 * 60); // Convertir a horas
    }

    // Tasa de resolución
    const resolvedOrClosed = ticketStats.resolved + ticketStats.closed;
    const resolutionRate = ticketStats.total > 0 
      ? ((resolvedOrClosed / ticketStats.total) * 100).toFixed(1)
      : '0';

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          active: user.active,
          createdAt: user.createdAt,
          emailVerified: user.emailVerified,
        },
        stats: {
          tickets: ticketStats,
          priority: priorityStats,
          totalResponses: user._count.responses,
          avgResponseTimeHours: avgResponseTime.toFixed(2),
          resolutionRate: resolutionRate,
        },
        recentTickets: user.assignedTickets.slice(0, 10),
        recentResponses: user.responses.slice(0, 5),
      },
    });
  } catch (error: any) {
    console.error('Error fetching user details:', error);
    const status = error.message?.includes('sesión') ? 401 : 
                   error.message?.includes('permisos') ? 403 : 500;
    return NextResponse.json(
      { success: false, error: error.message || 'Error al obtener el usuario' },
      { status }
    );
  }
}

// PATCH /api/users/[id] - Actualizar usuario (solo ADMIN)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Solo ADMIN puede actualizar usuarios
    await requireRole(['ADMIN']);

    // Await params en Next.js 15
    const { id } = await params;

    const body = await request.json();
    const { name, email, role, active } = body;

    // Verificar que el usuario existe
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Si se está cambiando el email, verificar que no exista otro usuario con ese email
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email },
      });

      if (emailExists) {
        return NextResponse.json(
          { success: false, error: 'El email ya está registrado' },
          { status: 400 }
        );
      }
    }

    // Preparar datos de actualización
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;
    if (active !== undefined) updateData.active = active;

    // Actualizar usuario
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: 'Usuario actualizado exitosamente',
    });
  } catch (error: any) {
    console.error('Error updating user:', error);
    const status = error.message?.includes('sesión') ? 401 :
                   error.message?.includes('permisos') ? 403 : 500;
    return NextResponse.json(
      { success: false, error: error.message || 'Error al actualizar el usuario' },
      { status }
    );
  }
}

