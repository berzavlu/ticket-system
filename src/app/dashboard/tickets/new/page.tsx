'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewTicketPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'GENERAL',
    priority: 'MEDIUM',
    source: 'WEB_FORM',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerCompany: '',
    assignedToId: '',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users?active=true');
      const data = await response.json();
      setUsers(data.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          priority: formData.priority,
          source: formData.source,
          customer: {
            name: formData.customerName,
            email: formData.customerEmail,
            phone: formData.customerPhone || undefined,
            company: formData.customerCompany || undefined,
          },
          assignedToId: formData.assignedToId || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        router.push(`/dashboard/tickets/${data.data.id}`);
      } else {
        alert('Error al crear el ticket: ' + data.error);
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
      alert('Error al crear el ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/tickets">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nuevo Ticket</h1>
          <p className="text-gray-600 mt-1">
            Crea un nuevo ticket en el sistema
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información del Ticket */}
        <Card>
          <CardHeader>
            <CardTitle>Información del Ticket</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Título *"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ej: Problema con facturación"
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe el problema o consulta..."
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label="Categoría *"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                options={[
                  { value: 'GENERAL', label: 'General' },
                  { value: 'TECHNICAL_SUPPORT', label: 'Soporte Técnico' },
                  { value: 'BILLING', label: 'Facturación' },
                  { value: 'SALES', label: 'Ventas' },
                  { value: 'COMPLAINT', label: 'Queja' },
                  { value: 'SUGGESTION', label: 'Sugerencia' },
                  { value: 'OTHER', label: 'Otro' },
                ]}
              />

              <Select
                label="Prioridad *"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                options={[
                  { value: 'LOW', label: 'Baja' },
                  { value: 'MEDIUM', label: 'Media' },
                  { value: 'HIGH', label: 'Alta' },
                  { value: 'URGENT', label: 'Urgente' },
                ]}
              />

              <Select
                label="Fuente *"
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                options={[
                  { value: 'EMAIL', label: 'Email' },
                  { value: 'PHONE', label: 'Teléfono' },
                  { value: 'WEB_FORM', label: 'Formulario Web' },
                  { value: 'WHATSAPP', label: 'WhatsApp' },
                  { value: 'CHAT', label: 'Chat' },
                ]}
              />
            </div>
          </CardContent>
        </Card>

        {/* Información del Cliente */}
        <Card>
          <CardHeader>
            <CardTitle>Información del Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nombre *"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                placeholder="Nombre del cliente"
                required
              />

              <Input
                label="Email *"
                type="email"
                value={formData.customerEmail}
                onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                placeholder="cliente@email.com"
                required
              />

              <Input
                label="Teléfono"
                value={formData.customerPhone}
                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                placeholder="+51 999 999 999"
              />

              <Input
                label="Empresa"
                value={formData.customerCompany}
                onChange={(e) => setFormData({ ...formData, customerCompany: e.target.value })}
                placeholder="Nombre de la empresa"
              />
            </div>
          </CardContent>
        </Card>

        {/* Asignación */}
        <Card>
          <CardHeader>
            <CardTitle>Asignación (Opcional)</CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              label="Asignar a"
              value={formData.assignedToId}
              onChange={(e) => setFormData({ ...formData, assignedToId: e.target.value })}
              options={[
                { value: '', label: 'Sin asignar' },
                ...users.map((user) => ({
                  value: user.id,
                  label: `${user.name} (${user.email})`,
                })),
              ]}
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button type="submit" disabled={loading}>
            {loading ? 'Creando...' : 'Crear Ticket'}
          </Button>
          <Link href="/dashboard/tickets">
            <Button type="button" variant="secondary">
              Cancelar
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}