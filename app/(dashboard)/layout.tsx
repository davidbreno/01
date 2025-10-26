import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AppShell } from '@/components/layout/app-shell';
import { QueryProvider } from '@/providers/query-provider';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect('/login');
  }

  return (
    <QueryProvider>
      <AppShell
        user={{
          id: session.user.id,
          name: session.user.name ?? session.user.email ?? 'Usuário',
          email: session.user.email ?? 'sem-email',
          role: session.user.role
        }}
      >
        {children}
      </AppShell>
    </QueryProvider>
  );
}
