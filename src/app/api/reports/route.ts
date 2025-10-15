import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/permissions';

// GET /api/reports - Generar estadísticas de tickets (solo ADMIN)
export async function GET(request: NextRequest) {
  try {
    // Solo ADMIN puede generar reportes
    await requireRole(['ADMIN']);
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    // Si no se especifica mes/año, usar el actual
    const now = new Date();
    const targetMonth = month ? parseInt(month) : now.getMonth() + 1;
    const targetYear = year ? parseInt(year) : now.getFullYear();

    // Calcular fechas de inicio y fin del mes
    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

    // Total de tickets del mes
    const totalTickets = await prisma.ticket.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Tickets por estado
    const ticketsByStatus = await prisma.ticket.groupBy({
      by: ['status'],
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: true,
    });

    // Tickets por prioridad
    const ticketsByPriority = await prisma.ticket.groupBy({
      by: ['priority'],
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: true,
    });

    // Tickets por categoría
    const ticketsByCategory = await prisma.ticket.groupBy({
      by: ['category'],
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: true,
    });

    // Tickets cerrados con tiempo de resolución
    const closedTickets = await prisma.ticket.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status: {
          in: ['CLOSED', 'RESOLVED'],
        },
        closedAt: {
          not: null,
        },
      },
      select: {
        createdAt: true,
        closedAt: true,
      },
    });

    // Calcular tiempo promedio de resolución (en horas)
    let avgResolutionTime = 0;
    if (closedTickets.length > 0) {
      const totalResolutionTime = closedTickets.reduce((sum, ticket) => {
        const created = new Date(ticket.createdAt).getTime();
        const closed = new Date(ticket.closedAt!).getTime();
        const diffInHours = (closed - created) / (1000 * 60 * 60);
        return sum + diffInHours;
      }, 0);
      avgResolutionTime = totalResolutionTime / closedTickets.length;
    }

    // Top agentes con más tickets asignados
    const topAgents = await prisma.user.findMany({
      where: {
        assignedTickets: {
          some: {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        _count: {
          select: {
            assignedTickets: true,
          },
        },
      },
      orderBy: {
        assignedTickets: {
          _count: 'desc',
        },
      },
      take: 5,
    });

    // Preparar respuesta
    const report = {
      month: targetMonth,
      year: targetYear,
      period: {
        start: startDate,
        end: endDate,
      },
      totalTickets,
      ticketsByStatus: ticketsByStatus.map((item) => ({
        status: item.status,
        count: item._count,
      })),
      ticketsByPriority: ticketsByPriority.map((item) => ({
        priority: item.priority,
        count: item._count,
      })),
      ticketsByCategory: ticketsByCategory.map((item) => ({
        category: item.category,
        count: item._count,
      })),
      closedTicketsCount: closedTickets.length,
      avgResolutionTimeHours: parseFloat(avgResolutionTime.toFixed(2)),
      topAgents,
    };

    return NextResponse.json({
      success: true,
      data: report,
    });
  } catch (error: any) {
    console.error('Error generating report:', error);
    const status = error.message?.includes('sesión') ? 401 : 
                   error.message?.includes('permisos') ? 403 : 500;
    return NextResponse.json(
      { success: false, error: error.message || 'Error al generar el reporte' },
      { status }
    );
  }
}