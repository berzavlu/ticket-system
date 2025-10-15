// Enums
export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  PENDING = 'PENDING',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum Category {
  GENERAL = 'GENERAL',
  TECHNICAL_SUPPORT = 'TECHNICAL_SUPPORT',
  BILLING = 'BILLING',
  SALES = 'SALES',
  COMPLAINT = 'COMPLAINT',
  SUGGESTION = 'SUGGESTION',
  OTHER = 'OTHER',
}

export enum Source {
  EMAIL = 'EMAIL',
  PHONE = 'PHONE',
  WEB_FORM = 'WEB_FORM',
  WHATSAPP = 'WHATSAPP',
  CHAT = 'CHAT',
}

export enum Role {
  ADMIN = 'ADMIN',
  AGENT = 'AGENT',
  SUPERVISOR = 'SUPERVISOR',
  CUSTOMER = 'CUSTOMER',
}

// Interfaces
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  category: Category;
  priority: Priority;
  status: TicketStatus;
  source: Source;
  createdAt: Date;
  updatedAt: Date;
  assignedAt?: Date | null;
  closedAt?: Date | null;
  customerId: string;
  customer?: Customer;
  assignedToId?: string | null;
  assignedTo?: User | null;
  responses?: Response[];
}

export interface Response {
  id: string;
  message: string;
  isInternal: boolean;
  createdAt: Date;
  ticketId: string;
  userId: string;
  user?: User;
}

export interface Report {
  month: number;
  year: number;
  period: {
    start: Date;
    end: Date;
  };
  totalTickets: number;
  ticketsByStatus: Array<{ status: string; count: number }>;
  ticketsByPriority: Array<{ priority: string; count: number }>;
  ticketsByCategory: Array<{ category: string; count: number }>;
  closedTicketsCount: number;
  avgResolutionTimeHours: number;
  topAgents: Array<{ 
    name: string; 
    _count: { assignedTickets: number } 
  }>;
}

// Form data types
export interface CreateTicketData {
  title: string;
  description: string;
  category?: Category;
  priority?: Priority;
  source?: Source;
  customer: {
    name: string;
    email: string;
    phone?: string;
    company?: string;
  };
  assignedToId?: string;
}

export interface UpdateTicketData {
  title?: string;
  description?: string;
  category?: Category;
  priority?: Priority;
  status?: TicketStatus;
  assignedToId?: string;
}

export interface CreateResponseData {
  ticketId: string;
  userId: string;
  message: string;
  isInternal?: boolean;
}

export interface CreateUserData {
  email: string;
  name: string;
  password: string;
  role?: Role;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  count?: number;
}

// Traducciones
export const STATUS_LABELS: Record<TicketStatus, string> = {
  [TicketStatus.OPEN]: 'Abierto',
  [TicketStatus.IN_PROGRESS]: 'En Progreso',
  [TicketStatus.PENDING]: 'Pendiente',
  [TicketStatus.RESOLVED]: 'Resuelto',
  [TicketStatus.CLOSED]: 'Cerrado',
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  [Priority.LOW]: 'Baja',
  [Priority.MEDIUM]: 'Media',
  [Priority.HIGH]: 'Alta',
  [Priority.URGENT]: 'Urgente',
};

export const CATEGORY_LABELS: Record<Category, string> = {
  [Category.GENERAL]: 'General',
  [Category.TECHNICAL_SUPPORT]: 'Soporte Técnico',
  [Category.BILLING]: 'Facturación',
  [Category.SALES]: 'Ventas',
  [Category.COMPLAINT]: 'Queja',
  [Category.SUGGESTION]: 'Sugerencia',
  [Category.OTHER]: 'Otro',
};

export const SOURCE_LABELS: Record<Source, string> = {
  [Source.EMAIL]: 'Email',
  [Source.PHONE]: 'Teléfono',
  [Source.WEB_FORM]: 'Formulario Web',
  [Source.WHATSAPP]: 'WhatsApp',
  [Source.CHAT]: 'Chat',
};

export const ROLE_LABELS: Record<Role, string> = {
  [Role.ADMIN]: 'Administrador',
  [Role.AGENT]: 'Agente',
  [Role.SUPERVISOR]: 'Supervisor',
  [Role.CUSTOMER]: 'Cliente',
};

// Utilidades de color
export const STATUS_COLORS: Record<TicketStatus, string> = {
  [TicketStatus.OPEN]: 'bg-blue-100 text-blue-800',
  [TicketStatus.IN_PROGRESS]: 'bg-yellow-100 text-yellow-800',
  [TicketStatus.PENDING]: 'bg-orange-100 text-orange-800',
  [TicketStatus.RESOLVED]: 'bg-green-100 text-green-800',
  [TicketStatus.CLOSED]: 'bg-gray-100 text-gray-800',
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  [Priority.LOW]: 'bg-gray-100 text-gray-800',
  [Priority.MEDIUM]: 'bg-blue-100 text-blue-800',
  [Priority.HIGH]: 'bg-orange-100 text-orange-800',
  [Priority.URGENT]: 'bg-red-100 text-red-800',
};