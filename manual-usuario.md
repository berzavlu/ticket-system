# 5) Manual de Usuario

## Objetivo
Guiar a usuarios finales en el uso del sistema de gestión de tickets según su rol.

## Acceso al sistema
- URL local: `http://localhost:3000`
- Pantalla de login: `/login`

## Tipos de acceso
- **Admin/Supervisor/Agente:** ingreso con email + contraseña.
- **Cliente:** ingreso con email y enlace mágico (magic link).

## Flujo para Cliente (CUSTOMER)

### 1. Iniciar sesión
1. Ir a `/login`.
2. Elegir modo Usuario.
3. Ingresar email.
4. Abrir el enlace recibido por correo.

### 2. Crear ticket
1. Ir a `/my-tickets`.
2. Click en “Nuevo Ticket”.
3. Completar título, descripción, categoría, prioridad y origen.
4. Guardar.

### 3. Consultar ticket
1. En listado “Mis Tickets”, abrir el ticket.
2. Revisar estado, prioridad y respuestas públicas.

### 4. Responder ticket
1. Entrar al detalle del ticket.
2. Escribir mensaje y enviar.

---

## Flujo para Agente (AGENT)

### 1. Ver cola de trabajo
1. Iniciar sesión.
2. Ir a `/dashboard/tickets`.
3. Revisar tickets asignados y abiertos sin asignar.

### 2. Auto-asignación
1. Abrir ticket OPEN sin agente.
2. Asignarse a sí mismo.

### 3. Atención y seguimiento
1. Cambiar estado según avance.
2. Responder al cliente.
3. Usar nota interna cuando sea necesario.

### 4. Cierre
1. Marcar ticket como RESOLVED/CLOSED cuando corresponda.

---

## Flujo para Supervisor (SUPERVISOR)
- Ver tickets globales.
- Asignar tickets a agentes.
- Consultar usuarios y métricas individuales.
- No puede crear/editar usuarios administrativos.

## Flujo para Administrador (ADMIN)
- Todo lo del supervisor.
- Crear/editar/desactivar usuarios.
- Ver dashboard y reportes.
- Exportar reportes PDF.
- Consultar visualizador BPMN.

## Estados del ticket
- **OPEN:** recién registrado.
- **IN_PROGRESS:** en atención.
- **PENDING:** en espera de información/acción.
- **RESOLVED:** solución aplicada.
- **CLOSED:** cierre definitivo.

## Recomendaciones de uso
- Registrar títulos claros y descripciones completas.
- Usar prioridad URGENT solo para incidentes críticos.
- Evitar cerrar ticket sin validación de solución.
- Mantener notas internas objetivas y trazables.

## Solución de problemas comunes
- No llega magic link: revisar spam y configuración SMTP.
- Acceso denegado: validar rol y estado activo.
- No aparecen tickets: revisar filtros activos y permisos.
