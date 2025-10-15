'use client';

import { useSession, signOut } from 'next-auth/react';
import { LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const Navbar = () => {
  const { data: session } = useSession();
  const user = session?.user as any;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo y nombre de la empresa */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-blue-600">Fluyez</h1>
              <p className="text-xs text-gray-500">Gestión de Tickets</p>
            </div>
          </div>

          {/* Usuario y logout */}
          {user && (
            <div className="flex items-center gap-4">
              {/* Info del usuario */}
              <div className="flex items-center gap-3">
                <div className="hidden md:block text-right">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {user.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || '?'}
                  </span>
                </div>
              </div>

              {/* Botón de cerrar sesión */}
              <Button
                variant="ghost"
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="flex items-center gap-2"
                title="Cerrar Sesión"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

