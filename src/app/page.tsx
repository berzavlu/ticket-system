import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/login');
  }

  const role = (session.user as any).role;

  // Redirigir según el rol del usuario
  if (role === 'CUSTOMER') {
    redirect('/my-tickets');
  } else {
    redirect('/dashboard/tickets');
  }
}