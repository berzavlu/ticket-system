# 6) Guía de Instalación

## Requisitos previos
- Node.js >= 18
- MySQL >= 8.0
- npm (o yarn/pnpm)

## 1. Obtener el proyecto
```bash
git clone <repository-url>
cd ticket-system
```

## 2. Instalar dependencias
```bash
npm install
```

## 3. Crear base de datos
```sql
CREATE DATABASE ticket_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## 4. Configurar variables de entorno
Crear `.env` con base en `.env.example`:

```bash
cp .env.example .env
```

Variables mínimas:

```env
DATABASE_URL="mysql://usuario:password@localhost:3306/ticket_system?charset=utf8mb4"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="<secret>"
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="tu-email@gmail.com"
EMAIL_SERVER_PASSWORD="tu-password-app"
EMAIL_FROM="Sistema de Tickets <noreply@tuempresa.com>"
```

Generar secret:
```bash
openssl rand -base64 32
```

## 5. Preparar Prisma y datos
```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

## 6. Ejecutar en desarrollo
```bash
npm run dev
```

Abrir `http://localhost:3000`.

## 7. Usuarios de prueba (seed)
- ADMIN: `admin@fluyez.pe / password123`
- SUPERVISOR: `supervisor@fluyez.pe / password123`
- AGENT: `juan.perez@fluyez.pe / password123`
- AGENT: `maria.garcia@fluyez.pe / password123`

## 8. Scripts útiles
- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`
- `npm run prisma:studio`
- `npm run db:reset`

## 9. Verificación rápida post-instalación
- Login de ADMIN en `/login`.
- Creación/consulta de ticket.
- Registro de respuesta a ticket.
- Generación de reporte desde `/dashboard/reports`.

## 10. Errores frecuentes
- Error de conexión MySQL: revisar `DATABASE_URL` y servicio MySQL.
- Error auth: validar `NEXTAUTH_URL` y `NEXTAUTH_SECRET`.
- No envía correos: revisar credenciales SMTP y puerto TLS/SSL.
