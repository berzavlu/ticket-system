'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Plus, Eye } from 'lucide-react';
import { 
  STATUS_LABELS, 
  PRIORITY_LABELS, 
  STATUS_COLORS, 
  PRIORITY_COLORS 
} from '@/types';
import { formatRelativeTime } from '@/lib/utils';

export default function TicketsPage() {
  const { data: session } = useSession();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [agentFilter, setAgentFilter] = useState('');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  
  // Verificar si el usuario puede crear tickets (ADMIN o SUPERVISOR)
  const canCreateTicket = (session?.user as any)?.role === 'ADMIN' || (session?.user as any)?.role === 'SUPERVISOR';
  
  // Verificar si el usuario puede ver filtro de agente (ADMIN o SUPERVISOR)
  const canFilterByAgent = (session?.user as any)?.role === 'ADMIN' || (session?.user as any)?.role === 'SUPERVISOR';

  useEffect(() => {
    fetchTickets();
    fetchUsers();
  }, [statusFilter, priorityFilter, agentFilter, dateFromFilter, dateToFilter]);
  
  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users?active=true');
      const data = await response.json();
      setUsers(data.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (priorityFilter) params.append('priority', priorityFilter);
      if (agentFilter) params.append('assignedToId', agentFilter);
      if (dateFromFilter) params.append('dateFrom', dateFromFilter);
      if (dateToFilter) params.append('dateTo', dateToFilter);

      const response = await fetch(`/api/tickets?${params.toString()}`);
      const data = await response.json();
      setTickets(data.data || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tickets</h1>
          <p className="text-gray-600 mt-1">
            Gestiona todos los tickets del sistema
          </p>
        </div>
        {/* Solo ADMIN y SUPERVISOR pueden crear tickets */}
        {canCreateTicket && (
          <Link href="/dashboard/tickets/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Ticket
            </Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Select
              label="Estado"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: '', label: 'Todos los estados' },
                { value: 'OPEN', label: 'Abierto' },
                { value: 'IN_PROGRESS', label: 'En Progreso' },
                { value: 'PENDING', label: 'Pendiente' },
                { value: 'RESOLVED', label: 'Resuelto' },
                { value: 'CLOSED', label: 'Cerrado' },
              ]}
            />
            <Select
              label="Prioridad"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              options={[
                { value: '', label: 'Todas las prioridades' },
                { value: 'LOW', label: 'Baja' },
                { value: 'MEDIUM', label: 'Media' },
                { value: 'HIGH', label: 'Alta' },
                { value: 'URGENT', label: 'Urgente' },
              ]}
            />
            {/* Filtro de agente solo para ADMIN y SUPERVISOR */}
            {canFilterByAgent && (
              <Select
                label="Agente Asignado"
                value={agentFilter}
                onChange={(e) => setAgentFilter(e.target.value)}
                options={[
                  { value: '', label: 'Todos los agentes' },
                  { value: 'unassigned', label: 'Sin asignar' },
                  ...users
                    .filter((user) => user.role !== 'CUSTOMER')
                    .map((user) => ({
                      value: user.id,
                      label: user.name,
                    })),
                ]}
              />
            )}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Desde
              </label>
              <input
                type="date"
                value={dateFromFilter}
                onChange={(e) => setDateFromFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Hasta
              </label>
              <input
                type="date"
                value={dateToFilter}
                onChange={(e) => setDateToFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end">
              <Button
                variant="secondary"
                onClick={() => {
                  setStatusFilter('');
                  setPriorityFilter('');
                  setAgentFilter('');
                  setDateFromFilter('');
                  setDateToFilter('');
                }}
                className="w-full"
              >
                Limpiar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando tickets...</p>
          </div>
        </div>
      ) : tickets.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-600">No se encontraron tickets</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <Card key={ticket.id} className="hover:shadow-lg transition-shadow">
              <CardContent>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {ticket.title}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded ${STATUS_COLORS[ticket.status as keyof typeof STATUS_COLORS]}`}>
                        {STATUS_LABELS[ticket.status as keyof typeof STATUS_LABELS]}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded ${PRIORITY_COLORS[ticket.priority as keyof typeof PRIORITY_COLORS]}`}>
                        {PRIORITY_LABELS[ticket.priority as keyof typeof PRIORITY_LABELS]}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-3 line-clamp-2">
                      {ticket.description}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>
                        <strong>Cliente:</strong> {ticket.customer.name}
                      </span>
                      <span>•</span>
                      <span>
                        {formatRelativeTime(ticket.createdAt)}
                      </span>
                      {ticket.assignedTo && (
                        <>
                          <span>•</span>
                          <span>
                            <strong>Asignado a:</strong> {ticket.assignedTo.name}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <Link href={`/dashboard/tickets/${ticket.id}`}>
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      Ver Detalle
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}