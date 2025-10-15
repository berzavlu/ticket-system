import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateReportPDF } from '@/lib/pdf-generator';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    const now = new Date();
    const targetMonth = month ? parseInt(month) : now.getMonth() + 1;
    const targetYear = year ? parseInt(year) : now.getFullYear();

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

    // Obtener datos del reporte
    const totalTickets = await prisma.ticket.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

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

    const reportData = {
      month: targetMonth,
      year: targetYear,
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

    // Generar PDF
    const pdfDoc = generateReportPDF(reportData);
    const pdfBuffer = Buffer.from(pdfDoc.output('arraybuffer'));

    // Preparar respuesta con el PDF
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    const filename = `Reporte_${monthNames[targetMonth - 1]}_${targetYear}.pdf`;

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { success: false, error: 'Error al generar el PDF' },
      { status: 500 }
    );
  }
}