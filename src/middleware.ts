import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Si no hay token, permitir que NextAuth redirija al login
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    const role = token.role as string;

    // Proteger rutas de dashboard
    if (path.startsWith('/dashboard')) {
      // Dashboard principal y reportes solo para ADMIN
      if (path === '/dashboard' || path.startsWith('/dashboard/reports')) {
        if (role !== 'ADMIN') {
          return NextResponse.redirect(new URL('/dashboard/tickets', req.url));
        }
      }

      // Usuarios solo para ADMIN
      if (path.startsWith('/dashboard/users')) {
        if (role !== 'ADMIN') {
          return NextResponse.redirect(new URL('/dashboard/tickets', req.url));
        }
      }

      // Customers no pueden acceder al dashboard en absoluto, redirigir a su vista
      if (role === 'CUSTOMER') {
        return NextResponse.redirect(new URL('/my-tickets', req.url));
      }
    }

    // Proteger rutas de API
    if (path.startsWith('/api')) {
      // Reportes solo para ADMIN
      if (path.startsWith('/api/reports') && role !== 'ADMIN') {
        return NextResponse.json(
          { success: false, error: 'No tiene permisos para acceder a este recurso' },
          { status: 403 }
        );
      }

      // Usuarios solo para ADMIN y SUPERVISOR
      if (path.startsWith('/api/users') && !['ADMIN', 'SUPERVISOR'].includes(role)) {
        return NextResponse.json(
          { success: false, error: 'No tiene permisos para acceder a este recurso' },
          { status: 403 }
        );
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/tickets/:path*',
    '/api/responses/:path*',
    '/api/reports/:path*',
    '/api/users/:path*',
    '/my-tickets/:path*',
  ],
};

