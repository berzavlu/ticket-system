import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ReportData {
  month: number;
  year: number;
  totalTickets: number;
  ticketsByStatus: Array<{ status: string; count: number }>;
  ticketsByPriority: Array<{ priority: string; count: number }>;
  ticketsByCategory: Array<{ category: string; count: number }>;
  closedTicketsCount: number;
  avgResolutionTimeHours: number;
  topAgents: Array<{ name: string; _count: { assignedTickets: number } }>;
}

const monthNames = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const statusTranslations: { [key: string]: string } = {
  OPEN: 'Abierto',
  IN_PROGRESS: 'En Progreso',
  PENDING: 'Pendiente',
  RESOLVED: 'Resuelto',
  CLOSED: 'Cerrado',
};

const priorityTranslations: { [key: string]: string } = {
  LOW: 'Baja',
  MEDIUM: 'Media',
  HIGH: 'Alta',
  URGENT: 'Urgente',
};

const categoryTranslations: { [key: string]: string } = {
  GENERAL: 'General',
  TECHNICAL_SUPPORT: 'Soporte Técnico',
  BILLING: 'Facturación',
  SALES: 'Ventas',
  COMPLAINT: 'Queja',
  SUGGESTION: 'Sugerencia',
  OTHER: 'Otro',
};

export function generateReportPDF(data: ReportData): jsPDF {
  const doc = new jsPDF();
  
  // Configuración
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  // Header - Logo y empresa
  doc.setFillColor(41, 128, 185);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('Fluyez Digital Investments SAC', pageWidth / 2, 18, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Sistema de Gestión de Tickets', pageWidth / 2, 28, { align: 'center' });

  // Título del reporte
  yPosition = 50;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(`Reporte Mensual - ${monthNames[data.month - 1]} ${data.year}`, 14, yPosition);

  // Información general
  yPosition += 15;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-PE')}`, 14, yPosition);
  yPosition += 7;
  doc.text(`RUC: 20607555681`, 14, yPosition);

  // Resumen ejecutivo
  yPosition += 15;
  doc.setFillColor(230, 230, 230);
  doc.rect(14, yPosition - 5, pageWidth - 28, 30, 'F');
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumen Ejecutivo', 18, yPosition);
  
  yPosition += 8;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total de tickets: ${data.totalTickets}`, 18, yPosition);
  
  yPosition += 6;
  doc.text(`Tickets cerrados: ${data.closedTicketsCount}`, 18, yPosition);
  
  yPosition += 6;
  doc.text(`Tiempo promedio de resolución: ${data.avgResolutionTimeHours.toFixed(2)} horas`, 18, yPosition);

  // Tabla: Tickets por Estado
  yPosition += 20;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Tickets por Estado', 14, yPosition);
  
  yPosition += 5;
  autoTable(doc, {
    startY: yPosition,
    head: [['Estado', 'Cantidad', 'Porcentaje']],
    body: data.ticketsByStatus.map(item => [
      statusTranslations[item.status] || item.status,
      item.count.toString(),
      `${((item.count / data.totalTickets) * 100).toFixed(1)}%`
    ]),
    theme: 'striped',
    headStyles: { fillColor: [41, 128, 185] },
    margin: { left: 14, right: 14 },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Tabla: Tickets por Prioridad
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Tickets por Prioridad', 14, yPosition);
  
  yPosition += 5;
  autoTable(doc, {
    startY: yPosition,
    head: [['Prioridad', 'Cantidad', 'Porcentaje']],
    body: data.ticketsByPriority.map(item => [
      priorityTranslations[item.priority] || item.priority,
      item.count.toString(),
      `${((item.count / data.totalTickets) * 100).toFixed(1)}%`
    ]),
    theme: 'striped',
    headStyles: { fillColor: [41, 128, 185] },
    margin: { left: 14, right: 14 },
  });

  // Nueva página si es necesario
  yPosition = (doc as any).lastAutoTable.finalY + 15;
  if (yPosition > pageHeight - 60) {
    doc.addPage();
    yPosition = 20;
  }

  // Tabla: Tickets por Categoría
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Tickets por Categoría', 14, yPosition);
  
  yPosition += 5;
  autoTable(doc, {
    startY: yPosition,
    head: [['Categoría', 'Cantidad', 'Porcentaje']],
    body: data.ticketsByCategory.map(item => [
      categoryTranslations[item.category] || item.category,
      item.count.toString(),
      `${((item.count / data.totalTickets) * 100).toFixed(1)}%`
    ]),
    theme: 'striped',
    headStyles: { fillColor: [41, 128, 185] },
    margin: { left: 14, right: 14 },
  });

  // Nueva página para Top Agentes
  yPosition = (doc as any).lastAutoTable.finalY + 15;
  if (yPosition > pageHeight - 60) {
    doc.addPage();
    yPosition = 20;
  }

  // Tabla: Top Agentes
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Top 5 Agentes con Más Tickets Asignados', 14, yPosition);
  
  yPosition += 5;
  autoTable(doc, {
    startY: yPosition,
    head: [['Agente', 'Tickets Asignados']],
    body: data.topAgents.map(agent => [
      agent.name,
      agent._count.assignedTickets.toString()
    ]),
    theme: 'striped',
    headStyles: { fillColor: [41, 128, 185] },
    margin: { left: 14, right: 14 },
  });

  // Footer
  const finalY = (doc as any).lastAutoTable.finalY + 20;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(128, 128, 128);
  doc.text(
    'Este reporte fue generado automáticamente por el Sistema de Gestión de Tickets',
    pageWidth / 2,
    finalY,
    { align: 'center' }
  );

  // Número de página
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Página ${i} de ${pageCount}`,
      pageWidth - 20,
      pageHeight - 10,
      { align: 'right' }
    );
  }

  return doc;
}