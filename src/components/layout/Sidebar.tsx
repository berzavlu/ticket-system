'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Ticket, 
  Users, 
  BarChart3,
  LogOut,
  Workflow 
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  user: {
    name: string;
    email: string;
    role: string;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({ user }) => {
  const pathname = usePathname();

  const menuItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      roles: ['ADMIN'], // Solo ADMIN
    },
    {
      name: 'Tickets',
      href: '/dashboard/tickets',
      icon: Ticket,
      roles: ['ADMIN', 'SUPERVISOR', 'AGENT'], // Todos menos CUSTOMER
    },
    {
      name: 'Usuarios',
      href: '/dashboard/users',
      icon: Users,
      roles: ['ADMIN', 'SUPERVISOR'], // ADMIN y SUPERVISOR
    },
    {
      name: 'Reportes',
      href: '/dashboard/reports',
      icon: BarChart3,
      roles: ['ADMIN'], // Solo ADMIN
    },
    {
      name: 'Flujo BPMN',
      href: '/dashboard/flujo-bpmn',
      icon: Workflow,
      roles: ['ADMIN', 'SUPERVISOR'], // ADMIN y SUPERVISOR
    },
  ];

  const filteredMenuItems = menuItems.filter(
    (item) => item.roles.includes(user.role)
  );

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold">Fluyez</h1>
        <p className="text-sm text-gray-400">Gestión de Tickets</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-sm font-semibold">
              {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{user.name}</p>
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
};