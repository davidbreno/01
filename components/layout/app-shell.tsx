'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, CalendarDays, FileText, PieChart, LogOut } from 'lucide-react';
import { Role } from '@prisma/client';
import { signOut } from 'next-auth/react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { cn } from '@/lib/utils';

interface ShellProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: Role;
  };
  children: React.ReactNode;
}

const links = [
  { label: 'Visão geral', href: '/dashboard', icon: LayoutDashboard, roles: [Role.ADMIN, Role.MEDICO, Role.RECEPCAO] },
  { label: 'Pacientes', href: '/pacientes', icon: Users, roles: [Role.ADMIN, Role.MEDICO, Role.RECEPCAO] },
  { label: 'Consultas', href: '/consultas', icon: CalendarDays, roles: [Role.ADMIN, Role.MEDICO, Role.RECEPCAO] },
  { label: 'Prontuários', href: '/prontuarios', icon: FileText, roles: [Role.ADMIN, Role.MEDICO] },
  { label: 'Relatórios', href: '/relatorios', icon: PieChart, roles: [Role.ADMIN, Role.RECEPCAO] }
];

export function AppShell({ user, children }: ShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-72 flex-col border-r bg-card/60 px-6 py-8 lg:flex">
        <div className="mb-12 space-y-1">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Clínica Prisma</p>
          <h1 className="text-xl font-semibold">Painel de pacientes</h1>
        </div>
        <nav className="flex flex-1 flex-col gap-2">
          {links
            .filter((link) => link.roles.includes(user.role))
            .map((link) => {
              const active = pathname.startsWith(link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    active ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
        </nav>
        <div className="mt-6 space-y-4 border-t pt-6">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <p className="font-medium leading-tight">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.role}</p>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={async () => {
              await signOut({ redirect: false });
              router.replace('/login');
            }}
          >
            <LogOut className="h-4 w-4" /> Sair
          </Button>
        </div>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b bg-background/90 px-6 py-4 backdrop-blur">
          <div className="flex flex-1 items-center gap-3">
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">{user.role}</span>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-6 bg-muted/30 px-4 py-6 lg:px-10">
          <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
