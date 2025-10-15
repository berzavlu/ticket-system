import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import EmailProvider from 'next-auth/providers/email';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import type { Adapter } from 'next-auth/adapters';
import { Role } from '@prisma/client';

// Función auxiliar para generar nombre desde email
function generateNameFromEmail(email: string): string {
  const username = email.split('@')[0];
  return username.charAt(0).toUpperCase() + username.slice(1).replace(/[._-]/g, ' ');
}

// Adapter personalizado que genera nombre automáticamente y asigna rol CUSTOMER
function CustomPrismaAdapter(p: typeof prisma): Adapter {
  const adapter = PrismaAdapter(p);
  
  return {
    ...adapter,
    createUser: async (data: { email: string; name?: string | null; emailVerified?: Date | null }) => {
      // Si no viene nombre, generarlo desde el email
      const name = data.name || generateNameFromEmail(data.email);
      
      // Crear el usuario directamente con Prisma con rol CUSTOMER
      const user = await p.user.create({
        data: {
          email: data.email,
          name: name,
          emailVerified: data.emailVerified ?? null,
          role: 'CUSTOMER', // Usuarios creados por magic link son CUSTOMER por defecto
        } as any
      });
      
      return {
        id: user.id,
        email: user.email,
        emailVerified: null,
        name: user.name ?? null,
      };
    }
  } as Adapter;
}

export const authOptions: NextAuthOptions = {
  adapter: CustomPrismaAdapter(prisma) as any,
  providers: [
    // Magic Link para usuarios regulares
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        secure: true,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
        tls: {
          rejectUnauthorized: false // Para evitar problemas con certificados SSL
        }
      },
      from: process.env.EMAIL_FROM,
    }),
    
    // Credenciales para administradores
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email y contraseña son requeridos');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error('Credenciales inválidas');
        }

        // Permitir login con contraseña para ADMIN, SUPERVISOR y AGENT
        // Solo CUSTOMER debe usar magic link
        if (user.role === ('CUSTOMER' as any)) {
          throw new Error('Acceso no autorizado. Use magic link.');
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error('Credenciales inválidas');
        }

        if (!user.active) {
          throw new Error('Usuario inactivo');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
    verifyRequest: '/verify-request',
    error: '/login',
  },
  callbacks: {
    async signIn({ user, account }) {
      // Si es login con email (magic link)
      if (account?.provider === 'email' && user.email) {
        // Esperar un momento para que la transacción del adapter se complete
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Verificar si el usuario existe en la base de datos
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email }
        });
        
        if (existingUser) {
          // Si existe pero no tiene nombre, generarlo desde el email
          if (!existingUser.name) {
            const emailUsername = user.email.split('@')[0];
            const name = emailUsername.charAt(0).toUpperCase() + emailUsername.slice(1).replace(/[._-]/g, ' ');
            
            await prisma.user.update({
              where: { email: user.email },
              data: { name }
            });
          }
          
          // Si no tiene contraseña (usuario magic link) y no es CUSTOMER, actualizarlo
          const isNotCustomer = existingUser.role !== ('CUSTOMER' as any);
          if (!existingUser.password && isNotCustomer) {
            await prisma.user.update({
              where: { email: user.email },
              data: { role: 'CUSTOMER' as any }
            });
          }
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      } else if (token.email) {
        // Actualizar el rol desde la base de datos en cada request
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email as string },
          select: { id: true, role: true }
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};