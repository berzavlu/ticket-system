# 🎫 Sistema de Gestión de Tickets - Fluyez

Sistema completo de gestión de tickets (helpdesk) desarrollado con Next.js 15, diseñado para empresas que necesitan gestionar solicitudes de soporte de manera eficiente y profesional.

---

## 📋 Tabla de Contenidos

- [Descripción](#-descripción)
- [Características Principales](#-características-principales)
- [Arquitectura](#-arquitectura)
- [Tecnologías Utilizadas](#-tecnologías-utilizadas)
- [Schema de la Base de Datos](#-schema-de-la-base-de-datos)
- [Módulos del Sistema](#-módulos-del-sistema)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Uso](#-uso)
- [Visualización de Proceso BPMN](#-visualización-de-proceso-bpmn)
- [Scripts Disponibles](#-scripts-disponibles)
- [Sistema de Roles y Permisos](#-sistema-de-roles-y-permisos)

---

## 📖 Descripción

**Fluyez Ticket System** es una aplicación web full-stack monolítica que permite a las empresas gestionar solicitudes de soporte técnico (tickets) de manera organizada y eficiente. El sistema implementa roles diferenciados (Admin, Supervisor, Agente, Cliente), autenticación múltiple, notificaciones por email, y un sistema completo de permisos basado en roles (RBAC).

### ¿Qué problemas resuelve?

- ✅ Gestión centralizada de solicitudes de soporte
- ✅ Asignación automática y manual de tickets a agentes
- ✅ Seguimiento del estado de cada solicitud
- ✅ Comunicación bidireccional entre clientes y equipo de soporte
- ✅ Reportes y estadísticas de rendimiento
- ✅ Notificaciones automáticas por email
- ✅ Control de acceso basado en roles

---

## ✨ Características Principales

### 🔐 Autenticación Dual
- **Credentials Provider**: Para staff (Admin, Supervisor, Agente) con email y contraseña
- **Email Provider (Magic Link)**: Para clientes sin necesidad de contraseña
- NextAuth.js para gestión de sesiones seguras

### 👥 Sistema de Roles (RBAC)

#### **ADMIN** - Control Total
- Gestión completa de usuarios (crear, editar, desactivar)
- Acceso a todos los tickets del sistema
- Generación de reportes estadísticos
- Asignación de tickets a cualquier agente
- Exportación de reportes a PDF

#### **SUPERVISOR** - Gestión y Supervisión
- Visualización de todos los tickets y usuarios
- Asignación de tickets a agentes
- Perfiles de usuario con estadísticas
- No puede crear o modificar usuarios
- No puede acceder a reportes (solo ADMIN)

#### **AGENT** - Soporte Operativo
- Visualización de tickets asignados a él
- Visualización de tickets abiertos sin asignar
- Auto-asignación de tickets disponibles
- Creación de respuestas públicas y notas internas
- No puede crear tickets

#### **CUSTOMER** - Cliente
- Creación de tickets de soporte
- Visualización solo de sus propios tickets
- Comunicación con el equipo de soporte
- Interfaz simplificada con navbar personalizado

### 🎫 Gestión de Tickets

- **Estados**: Abierto, En Progreso, Pendiente, Resuelto, Cerrado
- **Prioridades**: Baja, Media, Alta, Urgente
- **Categorías**: General, Soporte Técnico, Facturación, Ventas, Queja, Sugerencia, Otro
- **Fuentes**: Email, Teléfono, Formulario Web, WhatsApp, Chat
- **Filtros avanzados**: Por estado, prioridad, agente asignado, rango de fechas
- **Respuestas públicas** y **notas internas** (visibles solo para staff)

### 📧 Notificaciones por Email

- Envío automático de emails a clientes cuando reciben una respuesta
- Template HTML profesional con información del ticket
- Integración con Nodemailer (soporta Gmail, SendGrid, Mailgun, etc.)
- Manejo de errores sin bloquear operaciones

### 📊 Reportes y Estadísticas

- Dashboard con métricas generales (solo Admin)
- Estadísticas por agente (tickets asignados, resueltos, etc.)
- Perfiles de usuario con métricas detalladas
- Exportación de reportes a PDF
- Gráficos visuales con Recharts

### 🔄 Visualización de Procesos BPMN

- Diagrama BPMN 2.0 del proceso completo de tickets
- Visor interactivo con bpmn-js
- Controles de zoom y navegación
- Descarga como SVG o PNG
- Documentación visual del flujo de trabajo
- Accesible para Admin y Supervisor

### 🎨 Interfaz Moderna

- Diseño responsivo con Tailwind CSS
- Componentes reutilizables con React Server Components
- Dark mode en sidebar para staff
- Navbar personalizado para clientes
- Iconografía con Lucide React
- Estados de carga y feedback visual

---

## 🏗️ Arquitectura

### Arquitectura General

El sistema sigue una arquitectura **monolítica full-stack** basada en Next.js 15 con App Router, implementando el patrón **MVC adaptado para React Server Components**:

```
┌─────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                    │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Pages (RSC + Client Components)                │   │
│  │  • Dashboard, Tickets, Users, Reports           │   │
│  └─────────────────────────────────────────────────┘   │
│                          │                              │
│                          ↓                              │
│  ┌─────────────────────────────────────────────────┐   │
│  │  API Routes (Next.js API)                       │   │
│  │  • /api/tickets, /api/users, /api/responses     │   │
│  └─────────────────────────────────────────────────┘   │
│                          │                              │
└──────────────────────────┼──────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────┐
│              BACKEND LOGIC (Business Layer)             │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Permissions & Authorization                    │   │
│  │  • RBAC, Role checks, Ticket filters            │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Services & Utilities                           │   │
│  │  • Email, PDF generation, Auth                  │   │
│  └─────────────────────────────────────────────────┘   │
│                          │                              │
└──────────────────────────┼──────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────┐
│           DATABASE LAYER (Prisma ORM + MySQL)           │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Models: User, Customer, Ticket, Response       │   │
│  │  Relations, Indexes, Constraints                │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Patrones de Diseño

- **MVC (Model-View-Controller)**: Adaptado para Next.js App Router
  - **Model**: Prisma Schema y ORM
  - **View**: React Server Components y Client Components
  - **Controller**: API Routes

- **Repository Pattern**: Prisma Client actúa como repositorio
- **Singleton**: Prisma Client instanciado una sola vez
- **HOC (Higher Order Components)**: Middleware de autenticación
- **Factory Pattern**: Generación de PDFs y emails

### Flujo de Autenticación

```
┌────────────┐
│   Cliente  │
└──────┬─────┘
       │ 1. Login (email/password o magic link)
       ↓
┌──────────────────┐
│ NextAuth.js      │
│ (AuthProvider)   │
└──────┬───────────┘
       │ 2. Valida credenciales
       ↓
┌──────────────────┐
│ Prisma (MySQL)   │
│ User/Customer    │
└──────┬───────────┘
       │ 3. Retorna usuario
       ↓
┌──────────────────┐
│ Session Cookie   │
│ JWT Token        │
└──────┬───────────┘
       │ 4. Acceso autorizado
       ↓
┌──────────────────┐
│ Protected Pages  │
│ + API Routes     │
└──────────────────┘
```

### Flujo de Tickets

```
1. CREACIÓN
   Cliente crea ticket → API valida → Prisma guarda → Email opcional
   
2. ASIGNACIÓN
   Admin/Supervisor asigna → Actualiza assignedToId → Cambia estado
   
3. RESPUESTA
   Agente responde → Crea Response → Envía email al cliente
   
4. RESOLUCIÓN
   Agente/Admin marca como resuelto → Actualiza estado → Cliente confirma
   
5. CIERRE
   Admin/Cliente cierra ticket → Estado CLOSED → Genera estadísticas
```

---

## 🛠️ Tecnologías Utilizadas

### Frontend

| Tecnología | Versión | Descripción |
|------------|---------|-------------|
| **Next.js** | 15.5.5 | Framework React con SSR, App Router, API Routes |
| **React** | 19.1.0 | Librería UI con Server Components |
| **TypeScript** | 5.x | Tipado estático para JavaScript |
| **Tailwind CSS** | 3.4 | Framework CSS utility-first |
| **Lucide React** | 0.545 | Iconografía moderna y ligera |
| **Recharts** | 3.2 | Gráficos y visualización de datos |
| **bpmn-js** | Latest | Visor de diagramas BPMN 2.0 |

### Backend

| Tecnología | Versión | Descripción |
|------------|---------|-------------|
| **Next.js API Routes** | 15.5.5 | API REST integrada en Next.js |
| **NextAuth.js** | 4.24 | Autenticación y gestión de sesiones |
| **Prisma ORM** | 6.17 | ORM moderno para TypeScript |
| **Nodemailer** | 6.10 | Envío de emails SMTP |
| **bcryptjs** | 3.0 | Hashing de contraseñas |

### Base de Datos

| Tecnología | Versión | Descripción |
|------------|---------|-------------|
| **MySQL** | 8.0+ | Sistema de gestión de bases de datos relacional |
| **mysql2** | 3.15 | Driver MySQL para Node.js |

### Herramientas de Desarrollo

| Tecnología | Descripción |
|------------|-------------|
| **tsx** | Ejecución de TypeScript en Node.js |
| **ts-node** | Ejecución de scripts TypeScript |
| **date-fns** | Manipulación de fechas |
| **jsPDF** | Generación de PDFs |
| **clsx / tailwind-merge** | Utilidades para clases CSS |

---

## 🗄️ Schema de la Base de Datos

### Diagrama ER (Entity-Relationship)

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│    User     │         │   Customer   │         │   Ticket    │
├─────────────┤         ├──────────────┤         ├─────────────┤
│ id (PK)     │◄───┐    │ id (PK)      │◄────────│ id (PK)     │
│ email       │    │    │ name         │         │ title       │
│ name        │    └────│ userId (FK)  │    ┌────│ customerId  │
│ password    │         │ email        │    │    │ assignedTo  │
│ role        │         │ phone        │    │    │ status      │
│ active      │         │ company      │    │    │ priority    │
│ createdAt   │         └──────────────┘    │    │ category    │
└─────────────┘                             │    │ source      │
      │                                     │    └─────────────┘
      │ 1:N                                 │           │
      │                                     │           │ 1:N
      ↓                                     │           ↓
┌─────────────┐                             │    ┌─────────────┐
│  Response   │                             │    │  Response   │
├─────────────┤                             │    ├─────────────┤
│ id (PK)     │                             │    │ id (PK)     │
│ message     │                             └────│ ticketId    │
│ userId (FK) │                                  │ userId (FK) │
│ ticketId    │                                  │ message     │
│ isInternal  │                                  │ isInternal  │
│ createdAt   │                                  │ createdAt   │
└─────────────┘                                  └─────────────┘

┌────────────────┐
│    Account     │  (NextAuth)
├────────────────┤
│ id (PK)        │
│ userId (FK)    │
│ provider       │
│ providerAccId  │
└────────────────┘

┌────────────────┐
│    Session     │  (NextAuth)
├────────────────┤
│ id (PK)        │
│ sessionToken   │
│ userId (FK)    │
│ expires        │
└────────────────┘

┌────────────────┐
│ VerificationTkn│  (NextAuth)
├────────────────┤
│ identifier     │
│ token          │
│ expires        │
└────────────────┘
```

### Modelos Principales

#### **User** (Usuarios del Staff)
```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  password      String?
  role          Role      @default(AGENT)
  active        Boolean   @default(true)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  assignedTickets Ticket[] @relation("AssignedAgent")
  responses       Response[]
  customer        Customer?
}
```

**Roles disponibles**: `ADMIN`, `SUPERVISOR`, `AGENT`, `CUSTOMER`

#### **Customer** (Clientes)
```prisma
model Customer {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  phone     String?
  company   String?
  userId    String?  @unique
  
  tickets   Ticket[]
}
```

#### **Ticket** (Tickets de Soporte)
```prisma
model Ticket {
  id           String       @id @default(cuid())
  title        String
  description  String       @db.Text
  category     Category     @default(GENERAL)
  priority     Priority     @default(MEDIUM)
  status       TicketStatus @default(OPEN)
  source       Source       @default(EMAIL)
  customerId   String
  assignedToId String?
  
  customer    Customer  @relation(fields: [customerId])
  assignedTo  User?     @relation("AssignedAgent")
  responses   Response[]
}
```

**Estados**: `OPEN`, `IN_PROGRESS`, `PENDING`, `RESOLVED`, `CLOSED`  
**Prioridades**: `LOW`, `MEDIUM`, `HIGH`, `URGENT`  
**Categorías**: `GENERAL`, `TECHNICAL_SUPPORT`, `BILLING`, `SALES`, `COMPLAINT`, `SUGGESTION`, `OTHER`  
**Fuentes**: `EMAIL`, `PHONE`, `WEB_FORM`, `WHATSAPP`, `CHAT`

#### **Response** (Respuestas y Notas)
```prisma
model Response {
  id         String   @id @default(cuid())
  message    String   @db.Text
  isInternal Boolean  @default(false)
  ticketId   String
  userId     String
  
  ticket Ticket @relation(fields: [ticketId])
  user   User   @relation(fields: [userId])
}
```

**isInternal**: 
- `true` = Nota interna (solo visible para staff)
- `false` = Respuesta pública (visible para cliente)

### Índices Optimizados

```sql
-- Índices en Ticket para búsquedas rápidas
INDEX idx_tickets_customerId (customerId)
INDEX idx_tickets_assignedToId (assignedToId)
INDEX idx_tickets_status (status)
INDEX idx_tickets_createdAt (createdAt)

-- Índices en Response
INDEX idx_responses_ticketId (ticketId)
INDEX idx_responses_userId (userId)
INDEX idx_responses_createdAt (createdAt)

-- Índices únicos
UNIQUE idx_users_email (email)
UNIQUE idx_customers_email (email)
```

---

## 📦 Módulos del Sistema

### 1. **Módulo de Autenticación** (`/app/login`, `/lib/auth.ts`)

- Login con credenciales (staff)
- Login con magic link (clientes)
- Gestión de sesiones con NextAuth
- Middleware de protección de rutas
- Validación de roles y permisos

### 2. **Módulo de Usuarios** (`/app/dashboard/users`)

- CRUD completo de usuarios (solo Admin)
- Visualización de usuarios (Admin y Supervisor)
- Perfiles de usuario con estadísticas
- Activación/Desactivación de cuentas
- Gestión de roles

### 3. **Módulo de Tickets** (`/app/dashboard/tickets`, `/app/my-tickets`)

#### **Para Staff** (`/dashboard/tickets`):
- Listado con filtros avanzados
- Creación de tickets (Admin/Supervisor)
- Asignación de tickets a agentes
- Cambio de estado, prioridad, categoría
- Respuestas públicas y notas internas
- Vista detallada con historial completo

#### **Para Clientes** (`/my-tickets`):
- Navbar personalizado con branding
- Listado de tickets propios
- Creación de nuevos tickets
- Visualización de respuestas
- Estadísticas personales

### 4. **Módulo de Respuestas** (`/api/responses`)

- Creación de respuestas públicas
- Creación de notas internas
- Notificación automática por email
- Historial cronológico de conversaciones
- Indicador visual de quién respondió

### 5. **Módulo de Clientes** (`/api/customers`)

- Registro automático al crear ticket
- Sincronización con modelo User
- Gestión de información de contacto
- Historial de tickets del cliente

### 6. **Módulo de Reportes** (`/app/dashboard/reports`)

- Dashboard con métricas generales (solo Admin)
- Estadísticas de tickets por estado
- Estadísticas de tickets por prioridad
- Tickets por agente
- Tiempo promedio de resolución
- Exportación a PDF

### 7. **Módulo de Permisos** (`/lib/permissions.ts`)

- Sistema RBAC (Role-Based Access Control)
- Filtros dinámicos por rol
- Validación de acceso a tickets
- Validación de acceso a usuarios
- Permisos granulares por acción

### 8. **Módulo de Notificaciones** (`/lib/email.ts`)

- Envío de emails con Nodemailer
- Templates HTML profesionales
- Soporte para múltiples proveedores SMTP
- Manejo de errores sin bloqueo
- Previsualización de contenido en email

### 9. **Módulo de Visualización BPMN** (`/dashboard/flujo-bpmn`)

- Diagrama BPMN 2.0 completo del proceso de tickets
- Visor interactivo con navegación y zoom
- 30+ elementos BPMN (eventos, tareas, gateways)
- Descarga en formatos SVG y PNG
- Leyenda y documentación del proceso
- Herramienta de capacitación y documentación

---

## 📂 Estructura del Proyecto

```
ticket-system/
├── prisma/
│   ├── schema.prisma          # Schema de la base de datos
│   └── seed.ts                # Datos de prueba
│
├── src/
│   ├── app/
│   │   ├── api/               # API Routes de Next.js
│   │   │   ├── auth/          # NextAuth endpoints
│   │   │   ├── tickets/       # CRUD de tickets
│   │   │   ├── users/         # CRUD de usuarios
│   │   │   ├── responses/     # Respuestas y notas
│   │   │   ├── customers/     # Gestión de clientes
│   │   │   └── reports/       # Generación de reportes
│   │   │
│   │   ├── dashboard/         # Panel de control (Staff)
│   │   │   ├── tickets/       # Gestión de tickets
│   │   │   ├── users/         # Gestión de usuarios
│   │   │   ├── reports/       # Reportes y estadísticas
│   │   │   └── layout.tsx     # Layout con Sidebar
│   │   │
│   │   ├── my-tickets/        # Portal de clientes
│   │   │   ├── [id]/          # Detalle de ticket
│   │   │   ├── new/           # Crear ticket
│   │   │   ├── layout.tsx     # Layout con Navbar
│   │   │   └── page.tsx       # Listado de tickets
│   │   │
│   │   ├── login/             # Página de login
│   │   ├── verify-request/    # Verificación magic link
│   │   ├── layout.tsx         # Layout raíz
│   │   ├── page.tsx           # Página de inicio
│   │   └── globals.css        # Estilos globales
│   │
│   ├── components/
│   │   ├── layout/            # Componentes de layout
│   │   │   ├── Navbar.tsx     # Navbar para clientes
│   │   │   └── Sidebar.tsx    # Sidebar para staff
│   │   ├── ui/                # Componentes UI reutilizables
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Select.tsx
│   │   ├── tickets/           # Componentes de tickets
│   │   ├── users/             # Componentes de usuarios
│   │   └── providers/         # Context providers
│   │
│   ├── lib/
│   │   ├── auth.ts            # Configuración NextAuth
│   │   ├── permissions.ts     # Sistema RBAC
│   │   ├── prisma.ts          # Cliente Prisma
│   │   ├── email.ts           # Envío de emails
│   │   ├── pdf-generator.ts  # Generación de PDFs
│   │   └── utils.ts           # Utilidades generales
│   │
│   ├── types/
│   │   └── index.ts           # Tipos TypeScript
│   │
│   └── middleware.ts          # Middleware de Next.js
│
├── public/
│   └── ticket-process.bpmn    # Diagrama BPMN 2.0 del proceso
│
├── .env                       # Variables de entorno (crear)
├── .env.example               # Ejemplo de variables
├── package.json               # Dependencias
├── tsconfig.json              # Configuración TypeScript
├── tailwind.config.js         # Configuración Tailwind
├── next.config.ts             # Configuración Next.js
├── postcss.config.mjs         # Configuración PostCSS
└── README.md                  # Este archivo
```

---

## 🚀 Instalación

### Requisitos Previos

- **Node.js**: >= 18.x
- **MySQL**: >= 8.0
- **npm** o **yarn** o **pnpm**

### Paso 1: Clonar el Repositorio

```bash
git clone <repository-url>
cd ticket-system
```

### Paso 2: Instalar Dependencias

```bash
npm install
# o
yarn install
# o
pnpm install
```

### Paso 3: Configurar Base de Datos

1. **Crear base de datos MySQL:**

```sql
CREATE DATABASE ticket_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. **Crear archivo `.env`:**

```bash
cp .env.example .env
```

3. **Editar `.env` con tus credenciales:**

```env
# Database
DATABASE_URL="mysql://usuario:password@localhost:3306/ticket_system?charset=utf8mb4"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="genera-un-secret-aleatorio-aqui"

# Email Server
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="tu-email@gmail.com"
EMAIL_SERVER_PASSWORD="tu-password-de-aplicacion"
EMAIL_FROM="Sistema de Tickets <noreply@tuempresa.com>"
```

**Generar NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### Paso 4: Ejecutar Migraciones

```bash
# Generar cliente Prisma
npm run prisma:generate

# Ejecutar migraciones
npm run prisma:migrate

# Poblar base de datos con datos de prueba
npm run prisma:seed
```

### Paso 5: Iniciar Servidor de Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en: **http://localhost:3000**

---

## ⚙️ Configuración

### Variables de Entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DATABASE_URL` | URL de conexión a MySQL | `mysql://user:pass@localhost:3306/db` |
| `NEXT_PUBLIC_APP_URL` | URL pública de la app | `http://localhost:3000` |
| `NEXTAUTH_URL` | URL para NextAuth | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | Secret para JWT | Generar con `openssl rand -base64 32` |
| `EMAIL_SERVER_HOST` | Host del servidor SMTP | `smtp.gmail.com` |
| `EMAIL_SERVER_PORT` | Puerto SMTP | `587` (TLS) o `465` (SSL) |
| `EMAIL_SERVER_USER` | Usuario SMTP | `tu-email@gmail.com` |
| `EMAIL_SERVER_PASSWORD` | Contraseña SMTP | Password de aplicación |
| `EMAIL_FROM` | Email remitente | `Sistema <noreply@empresa.com>` |

### Configuración de Email

#### **Gmail:**
1. Ir a [Google Account - App Passwords](https://myaccount.google.com/apppasswords)
2. Generar contraseña de aplicación
3. Usar en `EMAIL_SERVER_PASSWORD`

```env
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="tu-email@gmail.com"
EMAIL_SERVER_PASSWORD="xxxx xxxx xxxx xxxx"
```

#### **SendGrid:**
```env
EMAIL_SERVER_HOST="smtp.sendgrid.net"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="apikey"
EMAIL_SERVER_PASSWORD="SG.xxxxxxxxxxxxx"
```

#### **Mailgun:**
```env
EMAIL_SERVER_HOST="smtp.mailgun.org"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="postmaster@tu-dominio.mailgun.org"
EMAIL_SERVER_PASSWORD="tu-password-mailgun"
```

---

## 💻 Uso

### Usuarios de Prueba

Después de ejecutar `npm run prisma:seed`, tendrás estos usuarios:

| Rol | Email | Password | Descripción |
|-----|-------|----------|-------------|
| **ADMIN** | admin@fluyez.pe | password123 | Control total del sistema |
| **SUPERVISOR** | supervisor@fluyez.pe | password123 | Supervisión y gestión |
| **AGENT** | juan.perez@fluyez.pe | password123 | Soporte operativo |
| **AGENT** | maria.garcia@fluyez.pe | password123 | Soporte operativo |

**Clientes**: Usa cualquier email no registrado para recibir magic link.

### Flujo de Trabajo

#### **Como Admin:**

1. **Login** en `/login` con `admin@fluyez.pe`
2. **Crear usuarios** en `/dashboard/users`
3. **Activar/Desactivar usuarios** con botón de power
4. **Ver todos los tickets** en `/dashboard/tickets`
5. **Asignar tickets** a agentes
6. **Ver reportes** en `/dashboard/reports`
7. **Exportar PDF** de reportes

#### **Como Supervisor:**

1. **Login** en `/login`
2. **Ver usuarios** (sin poder crear ni desactivar)
3. **Ver todos los tickets**
4. **Asignar tickets** a agentes
5. **Ver perfiles de usuario** con estadísticas

#### **Como Agente:**

1. **Login** en `/login`
2. **Ver tickets asignados** y abiertos
3. **Auto-asignarse tickets** disponibles
4. **Responder tickets** públicamente
5. **Crear notas internas** para el equipo
6. **Cambiar estado** de tickets

#### **Como Cliente:**

1. **Ir a** `/my-tickets`
2. **Ingresar email** (recibes magic link)
3. **Crear ticket** con botón "Nuevo Ticket"
4. **Ver tus tickets** y respuestas
5. **Responder** a mensajes del equipo

### Rutas Principales

| Ruta | Rol Requerido | Descripción |
|------|---------------|-------------|
| `/` | Público | Página de inicio |
| `/login` | Público | Login dual (staff/cliente) |
| `/dashboard` | ADMIN | Dashboard principal |
| `/dashboard/tickets` | ADMIN/SUPERVISOR/AGENT | Gestión de tickets |
| `/dashboard/tickets/new` | ADMIN/SUPERVISOR | Crear ticket |
| `/dashboard/tickets/[id]` | Staff | Detalle de ticket |
| `/dashboard/users` | ADMIN/SUPERVISOR | Gestión de usuarios |
| `/dashboard/users/[id]` | ADMIN/SUPERVISOR | Perfil de usuario |
| `/dashboard/reports` | ADMIN | Reportes y estadísticas |
| `/dashboard/flujo-bpmn` | ADMIN/SUPERVISOR | Visualización proceso BPMN |
| `/my-tickets` | CUSTOMER | Portal del cliente |
| `/my-tickets/new` | CUSTOMER | Crear ticket |
| `/my-tickets/[id]` | CUSTOMER | Ver ticket propio |

---

## 🔄 Visualización de Proceso BPMN

### Descripción

El sistema incluye un diagrama BPMN 2.0 (Business Process Model and Notation) que documenta visualmente el proceso completo de gestión de tickets, desde la creación hasta el cierre.

### Acceso al Visor

**Ruta:** `/dashboard/flujo-bpmn`

**Permisos:** ADMIN y SUPERVISOR

### Características del Diagrama

El diagrama BPMN incluye:

#### **Elementos del Proceso (30+ elementos):**
- **1 Evento de Inicio**: Cliente necesita soporte
- **1 Evento de Fin**: Ticket cerrado
- **7 Tareas de Usuario**: Acciones manuales (Cliente crea ticket, Agente analiza, etc.)
- **9 Tareas de Servicio**: Automatizaciones (Registrar en BD, Enviar email, etc.)
- **6 Gateways**: Puntos de decisión (¿Asignación automática?, ¿Resuelto?, etc.)
- **28 Flujos Secuenciales**: Conexiones entre elementos

#### **Fases del Proceso:**
1. **Creación**: Cliente crea ticket → Registro en BD
2. **Asignación**: Manual (Admin/Supervisor) o Auto (Agente)
3. **Análisis**: Evaluación y solicitud de información si es necesario
4. **Respuesta**: Creación de respuestas públicas o notas internas
5. **Resolución**: Marcado como resuelto y notificación
6. **Cierre**: Confirmación del cliente y generación de estadísticas

#### **Ciclos (Loops) Identificados:**
- **Loop de Información**: Si se requiere más datos del cliente
- **Loop de Trabajo Continuo**: Si el problema no está resuelto
- **Loop de Reapertura**: Si el cliente no confirma la resolución

### Funcionalidades del Visor

#### **Navegación:**
- Zoom In/Out con botones o scroll del mouse
- Pan (arrastrar) para mover el diagrama
- Fit viewport para ajustar a pantalla
- Indicador de zoom en porcentaje

#### **Descarga:**
- **SVG**: Formato vectorial escalable (ideal para documentación)
- **PNG**: Imagen de alta calidad con fondo blanco

#### **Información Adicional:**
- Descripción detallada del proceso
- Leyenda de símbolos BPMN
- Información de fases principales
- Listado de actores y automatizaciones

### Casos de Uso

1. **Documentación**: Material oficial del proceso para auditorías
2. **Capacitación**: Onboarding de nuevos empleados
3. **Mejora Continua**: Identificación de cuellos de botella
4. **Comunicación**: Presentaciones a stakeholders
5. **Cumplimiento**: Evidencia de procesos estandarizados

### Tecnología

- **bpmn-js**: Librería oficial de bpmn.io
- **BPMN 2.0**: Estándar internacional (OMG)
- **Formato**: XML con layout visual incluido

### Ejemplo de Flujo

```
[Inicio] → Cliente crea ticket → Guardar en BD
    ↓
¿Asignación automática?
    ├─ No: Admin/Supervisor asigna manualmente
    └─ Sí: Agente se auto-asigna
        ↓
Estado = EN_PROGRESO → Agente analiza
    ↓
¿Requiere más información?
    ├─ Sí: Solicitar info → Email → Estado = PENDING → Cliente responde
    └─ No: Continuar
        ↓
Crear respuesta → ¿Es nota interna?
    ├─ Sí: Guardar (sin email al cliente)
    └─ No: Guardar + Enviar email
        ↓
¿Problema resuelto?
    ├─ No: Continuar trabajando (loop)
    └─ Sí: Estado = RESOLVED → Notificar cliente
        ↓
¿Cliente confirma?
    ├─ No: Reabrir ticket (loop)
    └─ Sí: Estado = CLOSED → Generar estadísticas → [Fin]
```

---

## 📜 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Inicia servidor de desarrollo (localhost:3000)

# Build
npm run build            # Compila para producción
npm run start            # Inicia servidor de producción

# Prisma
npm run prisma:generate  # Genera cliente Prisma
npm run prisma:migrate   # Ejecuta migraciones
npm run prisma:studio    # Abre Prisma Studio (GUI)
npm run prisma:seed      # Puebla BD con datos de prueba

# Base de Datos
npm run db:reset         # Resetea BD y vuelve a poblar

# Linting
npm run lint             # Ejecuta ESLint
```

---

## 🔐 Sistema de Roles y Permisos

### Matriz de Permisos

| Acción | ADMIN | SUPERVISOR | AGENT | CUSTOMER |
|--------|-------|------------|-------|----------|
| **USUARIOS** | | | | |
| Ver todos los usuarios | ✅ | ✅ | ❌ | ❌ |
| Crear usuarios | ✅ | ❌ | ❌ | ❌ |
| Editar usuarios | ✅ | ❌ | ❌ | ❌ |
| Desactivar usuarios | ✅ | ❌ | ❌ | ❌ |
| Ver perfil de usuario | ✅ | ✅ | ❌ | ❌ |
| **TICKETS** | | | | |
| Ver todos los tickets | ✅ | ✅ | ❌ | ❌ |
| Ver tickets asignados | ✅ | ✅ | ✅ | ❌ |
| Ver tickets propios | ❌ | ❌ | ❌ | ✅ |
| Crear ticket (staff) | ✅ | ✅ | ❌ | ❌ |
| Crear ticket (cliente) | ❌ | ❌ | ❌ | ✅ |
| Asignar a cualquier agente | ✅ | ✅ | ❌ | ❌ |
| Auto-asignarse | ✅ | ✅ | ✅ | ❌ |
| Cambiar estado | ✅ | ✅ | ✅ | ❌ |
| Cambiar prioridad | ✅ | ✅ | ✅ | ❌ |
| **RESPUESTAS** | | | | |
| Crear respuesta pública | ✅ | ✅ | ✅ | ✅ |
| Crear nota interna | ✅ | ✅ | ✅ | ❌ |
| Ver notas internas | ✅ | ✅ | ✅ | ❌ |
| **REPORTES** | | | | |
| Ver dashboard | ✅ | ❌ | ❌ | ❌ |
| Ver reportes | ✅ | ❌ | ❌ | ❌ |
| Exportar PDF | ✅ | ❌ | ❌ | ❌ |

### Filtros de Tickets por Rol

- **ADMIN/SUPERVISOR**: Ven todos los tickets del sistema
- **AGENT**: Ve solo tickets asignados a él + tickets abiertos sin asignar
- **CUSTOMER**: Ve solo sus propios tickets

### Lógica de Permisos

Implementada en `/src/lib/permissions.ts`:

```typescript
// Ejemplo de validación
export async function canAccessTicket(ticketId: string) {
  const user = await getCurrentUser();
  
  if (user.role === 'ADMIN' || user.role === 'SUPERVISOR') {
    return true; // Acceso total
  }
  
  if (user.role === 'AGENT') {
    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
    // Solo si está asignado a él o es un ticket abierto sin asignar
    return ticket.assignedToId === user.id || 
           (ticket.status === 'OPEN' && !ticket.assignedToId);
  }
  
  // CUSTOMER solo ve sus tickets
  return ticket.customerId === user.customerId;
}
```

---

## 📞 Soporte

Para preguntas o problemas:

- **Email**: soporte@fluyez.pe
- **GitHub Issues**: [Crear issue](https://github.com/tu-org/ticket-system/issues)

---

## 📄 Licencia

Este proyecto es privado y confidencial. Todos los derechos reservados © 2025 Fluyez.

---

## 🙏 Agradecimientos

- [Next.js](https://nextjs.org/) - Framework React
- [Prisma](https://www.prisma.io/) - ORM moderno
- [NextAuth.js](https://next-auth.js.org/) - Autenticación
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS
- [Lucide](https://lucide.dev/) - Iconografía

---

**Desarrollado con ❤️ para Fluyez**

