import { Role } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import prisma from './prisma';

// Tipos de permisos en el sistema
export enum Permission {
  // Dashboard y reportes
  VIEW_DASHBOARD = 'VIEW_DASHBOARD',
  GENERATE_REPORTS = 'GENERATE_REPORTS',
  
  // Tickets
  VIEW_ALL_TICKETS = 'VIEW_ALL_TICKETS',
  VIEW_OWN_TICKETS = 'VIEW_OWN_TICKETS',
  CREATE_TICKET = 'CREATE_TICKET',
  UPDATE_TICKET = 'UPDATE_TICKET',
  DELETE_TICKET = 'DELETE_TICKET',
  ASSIGN_TICKET = 'ASSIGN_TICKET',
  
  // Usuarios
  MANAGE_USERS = 'MANAGE_USERS',
  VIEW_USERS = 'VIEW_USERS',
  
  // Respuestas
  CREATE_RESPONSE = 'CREATE_RESPONSE',
  VIEW_RESPONSES = 'VIEW_RESPONSES',
}

// Matriz de permisos por rol
const rolePermissions: Record<string, Permission[]> = {
  ADMIN: [
    Permission.VIEW_DASHBOARD,
    Permission.GENERATE_REPORTS,
    Permission.VIEW_ALL_TICKETS,
    Permission.CREATE_TICKET,
    Permission.UPDATE_TICKET,
    Permission.DELETE_TICKET,
    Permission.ASSIGN_TICKET,
    Permission.MANAGE_USERS,
    Permission.VIEW_USERS,
    Permission.CREATE_RESPONSE,
    Permission.VIEW_RESPONSES,
  ],
  SUPERVISOR: [
    Permission.VIEW_ALL_TICKETS,
    Permission.CREATE_TICKET,
    Permission.UPDATE_TICKET,
    Permission.ASSIGN_TICKET,
    Permission.VIEW_USERS,
    Permission.CREATE_RESPONSE,
    Permission.VIEW_RESPONSES,
  ],
  AGENT: [
    Permission.VIEW_OWN_TICKETS,
    Permission.UPDATE_TICKET,
    Permission.ASSIGN_TICKET, // Puede auto-asignarse tickets
    Permission.CREATE_RESPONSE,
    Permission.VIEW_RESPONSES,
  ],
  CUSTOMER: [
    Permission.VIEW_OWN_TICKETS,
    Permission.CREATE_TICKET,
    Permission.CREATE_RESPONSE,
  ],
};

// Verificar si un rol tiene un permiso específico
export function hasPermission(role: Role, permission: Permission): boolean {
  return rolePermissions[role]?.includes(permission) || false;
}

// Verificar múltiples permisos
export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(role, permission));
}

// Verificar todos los permisos
export function hasAllPermissions(role: Role, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(role, permission));
}

// Obtener la sesión del usuario con información completa
export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return null;
  }

  const user: any = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      customer: true,
    },
  });

  return user;
}

// Verificar si el usuario tiene permiso
export async function checkPermission(permission: Permission): Promise<boolean> {
  const user = await getCurrentUser();
  
  if (!user) {
    return false;
  }

  return hasPermission(user.role, permission);
}

// Verificar si el usuario puede acceder a un ticket específico
export async function canAccessTicket(ticketId: string): Promise<boolean> {
  const user = await getCurrentUser();
  
  if (!user) {
    return false;
  }

  // Admin y Supervisor pueden ver todos los tickets
  if (user.role === 'ADMIN' || user.role === 'SUPERVISOR') {
    return true;
  }

  // Agent solo puede ver tickets asignados a él o tickets abiertos sin asignar
  if (user.role === 'AGENT') {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      select: { 
        assignedToId: true,
        status: true,
      },
    });
    
    if (!ticket) {
      return false;
    }
    
    // Puede acceder si está asignado a él
    if (ticket.assignedToId === user.id) {
      return true;
    }
    
    // Puede acceder si es un ticket abierto sin asignar
    if (ticket.status === 'OPEN' && ticket.assignedToId === null) {
      return true;
    }
    
    return false;
  }

  // Customer solo puede ver sus propios tickets
  if (user.role === ('CUSTOMER' as any)) {
    // Buscar customer por email (puede no estar vinculado aún)
    let customer = (user as any).customer;
    
    if (!customer) {
      customer = await prisma.customer.findFirst({
        where: { email: user.email },
      });
      
      if (!customer) {
        return false; // No tiene customer, no puede acceder
      }
    }
    
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      select: { customerId: true },
    });

    return ticket?.customerId === customer.id;
  }

  return false;
}

// Obtener filtro de tickets según el rol del usuario
export async function getTicketFilter() {
  const user = await getCurrentUser();
  
  if (!user) {
    return null;
  }

  // Admin y Supervisor ven todos los tickets
  if (user.role === 'ADMIN' || user.role === 'SUPERVISOR') {
    return {};
  }

  // Agent solo ve tickets asignados a él o tickets abiertos sin asignar
  if (user.role === 'AGENT') {
    return {
      OR: [
        { assignedToId: user.id }, // Tickets asignados al agente
        { 
          status: 'OPEN',          // Tickets abiertos
          assignedToId: null       // Sin asignar
        }
      ]
    };
  }

  // Customer solo ve sus propios tickets
  if (user.role === ('CUSTOMER' as any)) {
    // Si no tiene customer vinculado, buscar o crear uno
    let customer = (user as any).customer;
    
    if (!customer) {
      // Buscar si existe un customer con este email
      customer = await prisma.customer.findFirst({
        where: { email: user.email },
      });
      
      // Si no existe, crear uno nuevo
      if (!customer) {
        customer = await prisma.customer.create({
          data: {
            name: user.name || 'Cliente',
            email: user.email,
            userId: user.id,
          } as any,
        });
      } else if (!(customer as any).userId) {
        // Si existe pero no está vinculado, vincularlo
        customer = await prisma.customer.update({
          where: { id: customer.id },
          data: { userId: user.id } as any,
        });
      }
    }
    
    return {
      customerId: customer.id,
    };
  }

  return null;
}

// Middleware de autorización para APIs
export async function requirePermission(permission: Permission) {
  const hasAccess = await checkPermission(permission);
  
  if (!hasAccess) {
    throw new Error('No tiene permisos para realizar esta acción');
  }
}

// Verificar si el usuario está autenticado y activo
export async function requireAuth() {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Debe iniciar sesión para acceder a este recurso');
  }

  if (!user.active) {
    throw new Error('Su cuenta está inactiva');
  }

  return user;
}

// Verificar si el usuario tiene uno de los roles especificados
export async function requireRole(roles: Role[]) {
  const user = await requireAuth();
  
  if (!roles.includes(user.role)) {
    throw new Error('No tiene permisos para acceder a este recurso');
  }

  return user;
}

