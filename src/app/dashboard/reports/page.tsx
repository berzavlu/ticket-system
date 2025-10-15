'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Download, FileText } from 'lucide-react';

const months = [
  { value: '1', label: 'Enero' },
  { value: '2', label: 'Febrero' },
  { value: '3', label: 'Marzo' },
  { value: '4', label: 'Abril' },
  { value: '5', label: 'Mayo' },
  { value: '6', label: 'Junio' },
  { value: '7', label: 'Julio' },
  { value: '8', label: 'Agosto' },
  { value: '9', label: 'Septiembre' },
  { value: '10', label: 'Octubre' },
  { value: '11', label: 'Noviembre' },
  { value: '12', label: 'Diciembre' },
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => ({
  value: String(currentYear - i),
  label: String(currentYear - i),
}));

export default function ReportsPage() {
  const currentMonth = new Date().getMonth() + 1;
  const [selectedMonth, setSelectedMonth] = useState(String(currentMonth));
  const [selectedYear, setSelectedYear] = useState(String(currentYear));
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/reports?month=${selectedMonth}&year=${selectedYear}`
      );
      const data = await response.json();
      setReport(data.data);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error al generar el reporte');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const response = await fetch(
        `/api/reports/pdf?month=${selectedMonth}&year=${selectedYear}`
      );
      
      if (!response.ok) {
        throw new Error('Error al generar el PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Reporte_${months[parseInt(selectedMonth) - 1].label}_${selectedYear}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Error al descargar el PDF');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reportes</h1>
        <p className="text-gray-600 mt-1">
          Genera reportes mensuales de tickets en formato PDF
        </p>
      </div>

      {/* Filter Card */}
      <Card>
        <CardHeader>
          <CardTitle>Generar Reporte</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Select
                label="Mes"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                options={months}
              />
            </div>
            <div className="flex-1">
              <Select
                label="Año"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                options={years}
              />
            </div>
            <div className="flex items-end gap-2">
              <Button
                onClick={handleGenerateReport}
                disabled={loading}
              >
                <FileText className="w-4 h-4 mr-2" />
                {loading ? 'Generando...' : 'Generar Reporte'}
              </Button>
              {report && (
                <Button
                  onClick={handleDownloadPDF}
                  disabled={downloading}
                  variant="secondary"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {downloading ? 'Descargando...' : 'Descargar PDF'}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Preview */}
      {report && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-600 mb-1">Total de Tickets</p>
                <p className="text-4xl font-bold text-gray-900">{report.totalTickets}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-600 mb-1">Tickets Cerrados</p>
                <p className="text-4xl font-bold text-green-600">{report.closedTicketsCount}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {((report.closedTicketsCount / report.totalTickets) * 100).toFixed(1)}% del total
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-600 mb-1">Tiempo Promedio de Resolución</p>
                <p className="text-4xl font-bold text-blue-600">
                  {report.avgResolutionTimeHours.toFixed(1)}h
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Status Table */}
          <Card>
            <CardHeader>
              <CardTitle>Tickets por Estado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Estado</th>
                      <th className="text-right py-3 px-4">Cantidad</th>
                      <th className="text-right py-3 px-4">Porcentaje</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.ticketsByStatus.map((item: any) => (
                      <tr key={item.status} className="border-b">
                        <td className="py-3 px-4">{item.status}</td>
                        <td className="text-right py-3 px-4 font-semibold">{item.count}</td>
                        <td className="text-right py-3 px-4">
                          {((item.count / report.totalTickets) * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Priority Table */}
          <Card>
            <CardHeader>
              <CardTitle>Tickets por Prioridad</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Prioridad</th>
                      <th className="text-right py-3 px-4">Cantidad</th>
                      <th className="text-right py-3 px-4">Porcentaje</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.ticketsByPriority.map((item: any) => (
                      <tr key={item.priority} className="border-b">
                        <td className="py-3 px-4">{item.priority}</td>
                        <td className="text-right py-3 px-4 font-semibold">{item.count}</td>
                        <td className="text-right py-3 px-4">
                          {((item.count / report.totalTickets) * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Category Table */}
          <Card>
            <CardHeader>
              <CardTitle>Tickets por Categoría</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Categoría</th>
                      <th className="text-right py-3 px-4">Cantidad</th>
                      <th className="text-right py-3 px-4">Porcentaje</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.ticketsByCategory.map((item: any) => (
                      <tr key={item.category} className="border-b">
                        <td className="py-3 px-4">{item.category}</td>
                        <td className="text-right py-3 px-4 font-semibold">{item.count}</td>
                        <td className="text-right py-3 px-4">
                          {((item.count / report.totalTickets) * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Top Agents */}
          <Card>
            <CardHeader>
              <CardTitle>Top 5 Agentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {report.topAgents.map((agent: any, index: number) => (
                  <div key={agent.name} className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{agent.name}</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${(agent._count.assignedTickets / report.totalTickets) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{agent._count.assignedTickets}</p>
                      <p className="text-xs text-gray-500">tickets</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}