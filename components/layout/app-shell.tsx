'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, CalendarDays, FileText, LogOut, Boxes, Settings, PanelLeftOpen, PanelRightOpen } from 'lucide-react';
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
  { label: 'Painel inteligente', href: '/dashboard', icon: LayoutDashboard, roles: [Role.ADMIN, Role.MEDICO, Role.RECEPCAO] },
  { label: 'Pacientes', href: '/pacientes', icon: Users, roles: [Role.ADMIN, Role.MEDICO, Role.RECEPCAO] },
  { label: 'Agenda', href: '/agenda', icon: CalendarDays, roles: [Role.ADMIN, Role.MEDICO, Role.RECEPCAO] },
  { label: 'Estoque', href: '/estoque', icon: Boxes, roles: [Role.ADMIN, Role.RECEPCAO, Role.MEDICO] },
  { label: 'Documentos', href: '/documentos', icon: FileText, roles: [Role.ADMIN, Role.MEDICO, Role.RECEPCAO] },
  { label: 'Configurações', href: '/configuracoes', icon: Settings, roles: [Role.ADMIN, Role.MEDICO, Role.RECEPCAO] }
];

export function AppShell({ user, children }: ShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen overflow-hidden">
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-72 transform border-r border-border/70 bg-card/80 px-6 py-8 shadow-xl backdrop-blur-xl transition-transform duration-300 ease-in-out lg:static lg:translate-x-0',
          menuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
        aria-hidden={!menuOpen}
      >
        <div className="mb-12 space-y-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
            Dr. David
          </span>
          <h1 className="text-2xl font-semibold leading-tight text-foreground">Plataforma Odontológica</h1>
          <p className="text-sm text-muted-foreground">Bem-vindo ao fluxo inteligente da sua clínica.</p>
        </div>
        <nav className="flex flex-1 flex-col gap-2">
          {links
            .filter((link) => link.roles.includes(user.role))
            .map((link) => {
              const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200 ease-out hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
                    active
                      ? 'bg-primary text-primary-foreground shadow-soft hover:bg-primary hover:text-primary-foreground'
                      : 'text-muted-foreground'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-4 w-4 transition-transform duration-200 ease-out',
                      active ? 'scale-110' : 'group-hover:scale-110'
                    )}
                  />
                  <span>{link.label}</span>
                </Link>
              );
            })}
        </nav>
        <div className="mt-10 space-y-6 rounded-2xl border border-border/60 bg-surface-50/60 p-5 shadow-inner">
          <div className="flex items-center gap-3">
            <Avatar className="shadow-soft">
              <AvatarFallback className="bg-primary/10 text-sm font-semibold uppercase text-primary">
                {user.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <p className="font-semibold text-foreground">{user.name}</p>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{user.role}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full justify-center gap-2 rounded-xl border-primary/30 bg-primary/5 text-sm font-semibold text-primary hover:bg-primary/10"
            onClick={async () => {
              await signOut({ redirect: false });
              router.replace('/login');
            }}
          >
            <LogOut className="h-4 w-4" /> Sair da plataforma
          </Button>
        </div>
      </aside>
      <div className="flex flex-1 flex-col lg:pl-0" data-menu-open={menuOpen}>
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border/60 bg-background/80 px-4 py-4 backdrop-blur-xl lg:px-8">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="inline-flex rounded-full border-primary/20 bg-primary/10 text-primary hover:bg-primary/20 lg:hidden"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            >
              {menuOpen ? <PanelRightOpen className="h-5 w-5" /> : <PanelLeftOpen className="h-5 w-5" />}
            </Button>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Fluxo de hoje</p>
              <h2 className="text-lg font-semibold text-foreground">Olá, {user.name.split(' ')[0]}</h2>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary/80 sm:inline-flex">
              {user.role}
            </span>
            <ThemeToggle />
          </div>
        </header>
        <main className="relative flex flex-1 flex-col gap-6 px-4 py-8 lg:px-10">
          <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-48 bg-gradient-to-b from-primary/10 via-transparent to-transparent" />
          <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6">{children}</div>
        </main>
      </div>
      {menuOpen ? <div className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm lg:hidden" onClick={() => setMenuOpen(false)} /> : null}
    </div>
  );
}
