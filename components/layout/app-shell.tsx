'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  CalendarDays,
  Cog,
  FileText,
  LayoutDashboard,
  LogOut,
  MoonStar,
  SunMedium,
  Users,
  Boxes
} from 'lucide-react';
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
  { label: 'Dashboard', description: 'Resumo inteligente', href: '/dashboard', icon: LayoutDashboard, roles: [Role.ADMIN, Role.MEDICO, Role.RECEPCAO] },
  { label: 'Pacientes', description: 'Cadastros e anamnese', href: '/pacientes', icon: Users, roles: [Role.ADMIN, Role.MEDICO, Role.RECEPCAO] },
  { label: 'Agenda', description: 'Consultas sincronizadas', href: '/agenda', icon: CalendarDays, roles: [Role.ADMIN, Role.MEDICO, Role.RECEPCAO] },
  { label: 'Estoque', description: 'Implantes e materiais', href: '/estoque', icon: Boxes, roles: [Role.ADMIN, Role.RECEPCAO, Role.MEDICO] },
  { label: 'Documentos', description: 'Receitas e radiografias', href: '/documentos', icon: FileText, roles: [Role.ADMIN, Role.MEDICO, Role.RECEPCAO] },
  { label: 'Configurações', description: 'Preferências do painel', href: '/configuracoes', icon: Cog, roles: [Role.ADMIN, Role.MEDICO, Role.RECEPCAO] }
];

export function AppShell({ user, children }: ShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const currentLink = useMemo(() => links.find((link) => pathname.startsWith(link.href)), [pathname]);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <aside
        className={cn(
          'relative hidden min-h-screen border-r border-white/10 bg-black/50 px-4 py-8 transition-[width] duration-500 ease-out backdrop-blur lg:flex',
          menuOpen ? 'w-72' : 'w-20'
        )}
      >
          <div className="flex flex-1 flex-col">
            <div className="mb-10 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 text-black font-semibold">
                DD
              </div>
              <div
                className={cn(
                  'origin-left transition-all duration-300',
                  menuOpen ? 'translate-x-0 opacity-100' : '-translate-x-3 opacity-0'
                )}
              >
                <p className="text-xs uppercase tracking-widest text-emerald-200/70">Dr. David</p>
                <h1 className="text-lg font-semibold">Plataforma Odonto</h1>
              </div>
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
                        'group relative flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-emerald-100/70 transition hover:bg-emerald-500/10 hover:text-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60',
                        active ? 'bg-emerald-500/20 text-emerald-50 shadow-lg shadow-emerald-500/10' : ''
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <div
                        className={cn(
                          'flex flex-col overflow-hidden transition-all duration-300',
                          menuOpen ? 'max-w-xs opacity-100' : 'max-w-0 opacity-0'
                        )}
                      >
                        <span>{link.label}</span>
                        <span className="text-[11px] font-normal uppercase tracking-wide text-emerald-200/50">
                          {link.description}
                        </span>
                      </div>
                      {!menuOpen ? (
                        <span className="pointer-events-none absolute left-full ml-4 hidden rounded-lg bg-black/90 px-3 py-1 text-xs text-emerald-100 shadow-xl group-hover:flex">
                          {link.label}
                        </span>
                      ) : null}
                    </Link>
                  );
                })}
            </nav>
            {menuOpen ? (
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 transition-all duration-300">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-emerald-500/20 text-emerald-100">
                      {user.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-sm text-emerald-50">
                    <p className="font-medium leading-tight">{user.name}</p>
                    <p className="text-xs uppercase tracking-wide text-emerald-200/60">{user.role}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="mt-4 w-full justify-center gap-2 border-emerald-400/40 bg-transparent text-emerald-100 hover:bg-emerald-500/20"
                  onClick={async () => {
                    await signOut({ redirect: false });
                    router.replace('/login');
                  }}
                >
                  <LogOut className="h-4 w-4" /> Sair da conta
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={async () => {
                  await signOut({ redirect: false });
                  router.replace('/login');
                }}
                className="mt-auto flex h-12 w-12 items-center justify-center self-center rounded-2xl border border-white/10 text-emerald-100/70 transition hover:border-emerald-400/60 hover:text-emerald-100"
                aria-label="Sair da conta"
              >
                <LogOut className="h-5 w-5" />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="absolute -right-4 top-12 hidden h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-emerald-500/20 text-emerald-100 shadow-emerald-500/40 transition hover:bg-emerald-500/40 lg:flex"
            aria-label={menuOpen ? 'Recolher menu lateral' : 'Expandir menu lateral'}
          >
            {menuOpen ? <MoonStar className="h-4 w-4" /> : <SunMedium className="h-4 w-4" />}
          </button>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-white/10 bg-black/40 px-4 py-4 backdrop-blur">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 items-center gap-3">
              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-white/5 text-emerald-100 lg:hidden"
                onClick={() => setMenuOpen((prev) => !prev)}
                aria-label="Alternar menu"
              >
                {menuOpen ? <MoonStar className="h-5 w-5" /> : <SunMedium className="h-5 w-5" />}
              </button>
              <div className="text-sm text-emerald-100/80">
                <p className="text-xs uppercase tracking-[0.3em] text-emerald-300/70">{user.role}</p>
                <p className="text-base font-semibold text-white">{currentLink?.label ?? 'Painel'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <div className="hidden text-right text-xs text-emerald-100/70 sm:block">
                <p>{user.email}</p>
                <p className="text-[10px] uppercase tracking-[0.35em] text-emerald-300/60">Sessão segura</p>
              </div>
            </div>
          </div>
        </header>
        <main className="flex flex-1 flex-col px-4 py-6 lg:px-8">
          <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
