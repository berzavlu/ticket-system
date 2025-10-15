import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Limpiar datos existentes
  await prisma.response.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();

  // Crear usuarios
  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@fluyez.pe',
      name: 'Administrador',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  const agent1 = await prisma.user.create({
    data: {
      email: 'juan.perez@fluyez.pe',
      name: 'Juan Pérez',
      password: hashedPassword,
      role: 'AGENT',
    },
  });

  const agent2 = await prisma.user.create({
    data: {
      email: 'maria.garcia@fluyez.pe',
      name: 'María García',
      password: hashedPassword,
      role: 'AGENT',
    },
  });

  const supervisor = await prisma.user.create({
    data: {
      email: 'supervisor@fluyez.pe',
      name: 'Carlos Supervisor',
      password: hashedPassword,
      role: 'SUPERVISOR',
    },
  });

  console.log('✅ Usuarios creados');

  // Crear clientes
  const customer1 = await prisma.customer.create({
    data: {
      name: 'Roberto Sánchez',
      email: 'roberto.sanchez@empresa.com',
      phone: '+51 987654321',
      company: 'Tech Solutions SAC',
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      name: 'Ana López',
      email: 'ana.lopez@gmail.com',
      phone: '+51 912345678',
      company: null,
    },
  });

  const customer3 = await prisma.customer.create({
    data: {
      name: 'Pedro Martínez',
      email: 'pedro.martinez@outlook.com',
      phone: '+51 998877665',
      company: 'Innovate Corp',
    },
  });

  console.log('✅ Clientes creados');

  // Crear tickets
  const ticket1 = await prisma.ticket.create({
    data: {
      title: 'Consulta sobre servicios de desarrollo web',
      description: 'Quisiera conocer más sobre sus servicios de desarrollo de aplicaciones web personalizadas. Necesito una cotización para un proyecto de e-commerce.',
      category: 'SALES',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      source: 'EMAIL',
      customerId: customer1.id,
      assignedToId: agent1.id,
      assignedAt: new Date(),
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 días atrás
    },
  });

  const ticket2 = await prisma.ticket.create({
    data: {
      title: 'Problema con facturación',
      description: 'No he recibido la factura del mes anterior. Por favor, necesito que me la envíen a la brevedad.',
      category: 'BILLING',
      priority: 'MEDIUM',
      status: 'RESOLVED',
      source: 'WEB_FORM',
      customerId: customer2.id,
      assignedToId: agent2.id,
      assignedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      closedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 días atrás
    },
  });

  const ticket3 = await prisma.ticket.create({
    data: {
      title: 'Solicitud de soporte técnico - API no responde',
      description: 'La API de integración dejó de funcionar desde esta mañana. Estamos teniendo errores 500 en todas las peticiones.',
      category: 'TECHNICAL_SUPPORT',
      priority: 'URGENT',
      status: 'OPEN',
      source: 'EMAIL',
      customerId: customer3.id,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
    },
  });

  const ticket4 = await prisma.ticket.create({
    data: {
      title: 'Sugerencia para mejorar la interfaz',
      description: 'Me gustaría sugerir algunas mejoras en la interfaz de usuario del dashboard. Tengo algunas ideas que podrían mejorar la experiencia.',
      category: 'SUGGESTION',
      priority: 'LOW',
      status: 'PENDING',
      source: 'WEB_FORM',
      customerId: customer1.id,
      assignedToId: agent1.id,
      assignedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 día atrás
    },
  });

  console.log('✅ Tickets creados');

  // Crear respuestas
  await prisma.response.create({
    data: {
      message: 'Hola Roberto, gracias por contactarnos. Le enviaré información detallada sobre nuestros servicios de desarrollo web.',
      isInternal: false,
      ticketId: ticket1.id,
      userId: agent1.id,
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.response.create({
    data: {
      message: 'Cliente interesado, parece un proyecto grande. Coordinar con ventas.',
      isInternal: true,
      ticketId: ticket1.id,
      userId: agent1.id,
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.response.create({
    data: {
      message: 'Estimada Ana, le he enviado la factura a su correo electrónico. Por favor confirme la recepción.',
      isInternal: false,
      ticketId: ticket2.id,
      userId: agent2.id,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.response.create({
    data: {
      message: 'Gracias por su sugerencia. La revisaremos con el equipo de producto.',
      isInternal: false,
      ticketId: ticket4.id,
      userId: agent1.id,
      createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000),
    },
  });

  console.log('✅ Respuestas creadas');

  console.log('\n🎉 Seed completado exitosamente!');
  console.log('\n📝 Usuarios creados:');
  console.log('   Admin: admin@fluyez.pe / password123');
  console.log('   Agente 1: juan.perez@fluyez.pe / password123');
  console.log('   Agente 2: maria.garcia@fluyez.pe / password123');
  console.log('   Supervisor: supervisor@fluyez.pe / password123');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });