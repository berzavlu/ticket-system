'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Send } from 'lucide-react';

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  createdAt: string;
  customer: {
    name: string;
    email: string;
  };
  assignedTo?: {
    name: string;
    email: string;
  };
  responses: Response[];
}

interface Response {
  id: string;
  message: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
  isInternal: boolean;
}

export default function TicketDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [responses, setResponses] = useState<Response[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchTicketDetails();
  }, [params.id]);

  const fetchTicketDetails = async () => {
    try {
      const [ticketRes, responsesRes] = await Promise.all([
        fetch(`/api/tickets/${params.id}`),
        fetch(`/api/responses?ticketId=${params.id}`),
      ]);

      const ticketData = await ticketRes.json();
      const responsesData = await responsesRes.json();

      if (ticketData.success) {
        setTicket(ticketData.data);
        // Las respuestas ya vienen en el ticket
        if (ticketData.data.responses) {
          setResponses(ticketData.data.responses);
        }
      }

      if (responsesData.success) {
        setResponses(responsesData.data);
      }
    } catch (error) {
      console.error('Error fetching ticket:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      const response = await fetch('/api/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticketId: params.id,
          message: newMessage,
          isInternal: false,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setNewMessage('');
        fetchTicketDetails(); // Recargar para obtener las nuevas respuestas
      } else {
        alert(data.error || 'Error al enviar el mensaje');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error al enviar el mensaje');
    } finally {
      setSending(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      OPEN: 'bg-blue-100 text-blue-800',
      IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
      PENDING: 'bg-orange-100 text-orange-800',
      RESOLVED: 'bg-green-100 text-green-800',
      CLOSED: 'bg-gray-100 text-gray-800',
    };

    const statusLabels = {
      OPEN: 'Abierto',
      IN_PROGRESS: 'En Progreso',
      PENDING: 'Pendiente',
      RESOLVED: 'Resuelto',
      CLOSED: 'Cerrado',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[status as keyof typeof statusStyles]}`}>
        {statusLabels[status as keyof typeof statusLabels] || status}
      </span>
    );
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
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Ticket no encontrado</h2>
          <Button onClick={() => router.push('/my-tickets')}>
            Volver a Mis Tickets
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/my-tickets')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{ticket.title}</h1>
          <p className="text-gray-600 mt-1">
            Ticket #{ticket.id.slice(0, 8)}
          </p>
        </div>
        {getStatusBadge(ticket.status)}
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ticket Description */}
            <Card>
              <CardHeader>
                <CardTitle>Descripción</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {ticket.description}
                </p>
                <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-500">
                  Creado el {new Date(ticket.createdAt).toLocaleString('es-ES')}
                </div>
              </CardContent>
            </Card>

            {/* Responses */}
            <Card>
              <CardHeader>
                <CardTitle>Conversación</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mb-6">
                  {responses.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      No hay respuestas aún
                    </p>
                  ) : (
                    responses.map((response) => (
                      <div
                        key={response.id}
                        className={`p-4 rounded-lg ${
                          response.user.email === session?.user?.email
                            ? 'bg-blue-50 ml-8'
                            : 'bg-gray-50 mr-8'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium text-gray-900">
                              {response.user.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(response.createdAt).toLocaleString('es-ES')}
                            </p>
                          </div>
                        </div>
                        <p className="text-gray-700 whitespace-pre-wrap">
                          {response.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                {/* New Message Form */}
                {ticket.status === 'CLOSED' || ticket.status === 'RESOLVED' ? (
                  <div className="border-t pt-4">
                    <div className="bg-gray-100 border border-gray-300 rounded-lg p-6 text-center">
                      <p className="text-gray-600 font-medium mb-2">
                        Este ticket está {ticket.status === 'CLOSED' ? 'cerrado' : 'resuelto'}
                      </p>
                      <p className="text-sm text-gray-500">
                        No se pueden agregar más comentarios a tickets cerrados o resueltos.
                      </p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSendMessage} className="border-t pt-4">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Escribe tu mensaje..."
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3"
                      disabled={sending}
                    />
                    <div className="flex justify-end">
                      <Button type="submit" disabled={sending || !newMessage.trim()}>
                        <Send className="w-4 h-4 mr-2" />
                        {sending ? 'Enviando...' : 'Enviar'}
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Detalles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Estado</p>
                  {getStatusBadge(ticket.status)}
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Prioridad</p>
                  <p className="text-sm font-medium">{ticket.priority}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Categoría</p>
                  <p className="text-sm font-medium">{ticket.category}</p>
                </div>

                {ticket.assignedTo && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Asignado a</p>
                    <p className="text-sm font-medium">{ticket.assignedTo.name}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
      </div>
    </div>
  );
}

