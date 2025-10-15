'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { ArrowLeft, Send, User, Mail, Phone, Building } from 'lucide-react';
import { 
  STATUS_LABELS, 
  PRIORITY_LABELS, 
  STATUS_COLORS, 
  PRIORITY_COLORS,
  CATEGORY_LABELS,
  SOURCE_LABELS
} from '@/types';
import { formatDateTime } from '@/lib/utils';
import { useSession } from 'next-auth/react';

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [ticket, setTicket] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [responseMessage, setResponseMessage] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTicket();
    fetchUsers();
  }, [params.id]);

  const fetchTicket = async () => {
    try {
      const response = await fetch(`/api/tickets/${params.id}`);
      const data = await response.json();
      setTicket(data.data);
    } catch (error) {
      console.error('Error fetching ticket:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users?active=true');
      const data = await response.json();
      setUsers(data.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/tickets/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchTicket();
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleAssignChange = async (userId: string) => {
    try {
      const response = await fetch(`/api/tickets/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedToId: userId || null }),
      });

      if (response.ok) {
        fetchTicket();
      } else {
        const data = await response.json();
        alert(data.error || 'Error al asignar ticket');
      }
    } catch (error) {
      console.error('Error updating assignment:', error);
      alert('Error al asignar ticket');
    }
  };
  
  const handleSelfAssign = async () => {
    const userId = (session?.user as any)?.id;
    if (!userId) return;
    
    try {
      const response = await fetch(`/api/tickets/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedToId: userId }),
      });

      if (response.ok) {
        fetchTicket();
      } else {
        const data = await response.json();
        alert(data.error || 'Error al asignarte el ticket');
      }
    } catch (error) {
      console.error('Error self-assigning ticket:', error);
      alert('Error al asignarte el ticket');
    }
  };

  const handleAddResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!responseMessage.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId: params.id,
          userId: (session?.user as any)?.id,
          message: responseMessage,
          isInternal,
        }),
      });

      if (response.ok) {
        setResponseMessage('');
        setIsInternal(false);
        fetchTicket();
      }
    } catch (error) {
      console.error('Error adding response:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando ticket...</p>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Ticket no encontrado</p>
        <Link href="/dashboard/tickets">
          <Button className="mt-4">Volver a Tickets</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/tickets">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{ticket.title}</h1>
          <p className="text-gray-600 mt-1">
            Ticket #{ticket.id.slice(0, 8)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ticket Details */}
          <Card>
            <CardHeader>
              <CardTitle>Detalles del Ticket</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 text-sm font-medium rounded ${STATUS_COLORS[ticket.status as keyof typeof STATUS_COLORS]}`}>
                  {STATUS_LABELS[ticket.status as keyof typeof STATUS_LABELS]}
                </span>
                <span className={`px-3 py-1 text-sm font-medium rounded ${PRIORITY_COLORS[ticket.priority as keyof typeof PRIORITY_COLORS]}`}>
                  {PRIORITY_LABELS[ticket.priority as keyof typeof PRIORITY_LABELS]}
                </span>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Descripción</h4>
                <p className="text-gray-900 whitespace-pre-wrap">{ticket.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-gray-600">Categoría</p>
                  <p className="font-medium">{CATEGORY_LABELS[ticket.category as keyof typeof CATEGORY_LABELS]}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Fuente</p>
                  <p className="font-medium">{SOURCE_LABELS[ticket.source as keyof typeof SOURCE_LABELS]}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Creado</p>
                  <p className="font-medium">{formatDateTime(ticket.createdAt)}</p>
                </div>
                {ticket.closedAt && (
                  <div>
                    <p className="text-sm text-gray-600">Cerrado</p>
                    <p className="font-medium">{formatDateTime(ticket.closedAt)}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Responses */}
          <Card>
            <CardHeader>
              <CardTitle>Seguimiento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {ticket.responses && ticket.responses.length > 0 ? (
                <div className="space-y-4">
                  {ticket.responses.map((response: any) => (
                    <div
                      key={response.id}
                      className={`p-4 rounded-lg ${
                        response.isInternal
                          ? 'bg-yellow-50 border border-yellow-200'
                          : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                            {response.user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{response.user.name}</p>
                            <p className="text-xs text-gray-500">{formatDateTime(response.createdAt)}</p>
                          </div>
                        </div>
                        {response.isInternal && (
                          <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">
                            Nota Interna
                          </span>
                        )}
                      </div>
                      <p className="text-gray-900 whitespace-pre-wrap">{response.message}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No hay respuestas aún
                </p>
              )}

              {/* Add Response Form */}
              <form onSubmit={handleAddResponse} className="pt-4 border-t">
                <div className="space-y-3">
                  <textarea
                    value={responseMessage}
                    onChange={(e) => setResponseMessage(e.target.value)}
                    placeholder="Escribe una respuesta..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isInternal}
                        onChange={(e) => setIsInternal(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Nota interna (no visible para el cliente)</span>
                    </label>
                    <Button type="submit" disabled={submitting}>
                      <Send className="w-4 h-4 mr-2" />
                      {submitting ? 'Enviando...' : 'Enviar Respuesta'}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle>Información del Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Nombre</p>
                  <p className="font-medium">{ticket.customer.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{ticket.customer.email}</p>
                </div>
              </div>
              {ticket.customer.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Teléfono</p>
                    <p className="font-medium">{ticket.customer.phone}</p>
                  </div>
                </div>
              )}
              {ticket.customer.company && (
                <div className="flex items-center gap-3">
                  <Building className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Empresa</p>
                    <p className="font-medium">{ticket.customer.company}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                label="Estado"
                value={ticket.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                options={[
                  { value: 'OPEN', label: 'Abierto' },
                  { value: 'IN_PROGRESS', label: 'En Progreso' },
                  { value: 'PENDING', label: 'Pendiente' },
                  { value: 'RESOLVED', label: 'Resuelto' },
                  { value: 'CLOSED', label: 'Cerrado' },
                ]}
              />

              {/* Asignación según rol */}
              {(session?.user as any)?.role === 'AGENT' ? (
                // Vista para AGENT
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Asignación
                  </label>
                  {!ticket.assignedToId && ticket.status === 'OPEN' ? (
                    // Ticket sin asignar - Mostrar botón para auto-asignarse
                    <Button
                      onClick={handleSelfAssign}
                      className="w-full"
                      variant="secondary"
                    >
                      Asignarme a mí
                    </Button>
                  ) : ticket.assignedToId === (session?.user as any)?.id ? (
                    // Ya asignado a este agente - Solo mostrar info
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800 mb-2">Asignado a ti:</p>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                          {ticket.assignedTo?.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-medium text-sm text-green-900">{ticket.assignedTo?.name}</p>
                          <p className="text-xs text-green-700">{ticket.assignedTo?.email}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Asignado a otro agente - Solo mostrar info (no debería llegar aquí según permisos)
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">Ticket no disponible</p>
                      <p className="text-xs text-gray-500">Este ticket no está disponible para ti</p>
                    </div>
                  )}
                </div>
              ) : (
                // Vista para ADMIN y SUPERVISOR - Dropdown normal
                <>
                  <Select
                    label="Asignar a"
                    value={ticket.assignedToId || ''}
                    onChange={(e) => handleAssignChange(e.target.value)}
                    options={[
                      { value: '', label: 'Sin asignar' },
                      ...users
                        .filter((u) => u.role !== 'CUSTOMER')
                        .map((user) => ({
                          value: user.id,
                          label: user.name,
                        })),
                    ]}
                  />

                  {ticket.assignedTo && (
                    <div className="pt-3 border-t">
                      <p className="text-sm text-gray-600 mb-2">Asignado actualmente a:</p>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                          {ticket.assignedTo.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{ticket.assignedTo.name}</p>
                          <p className="text-xs text-gray-500">{ticket.assignedTo.email}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}