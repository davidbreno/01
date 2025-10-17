'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, ArrowDownUp, CreditCard, BarChart3, Activity, Droplets, FlaskConical, FileScan, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

const navItems = [
  { label: 'Visão Geral', href: '/', icon: LayoutDashboard },
  { label: 'Entradas & Saídas', href: '/financeiro/entradas-saidas', icon: ArrowDownUp },
  { label: 'Contas', href: '/financeiro/contas', icon: CreditCard },
  { label: 'Relatórios', href: '/financeiro/relatorios', icon: BarChart3 },
  { label: 'Peso', href: '/saude/peso', icon: Activity },
  { label: 'Hidratação', href: '/saude/hidratacao', icon: Droplets },
  { label: 'Ciclos', href: '/saude/ciclos', icon: FlaskConical },
  { label: 'Exames', href: '/saude/exames', icon: FileScan },
  { label: 'Configurações', href: '/configuracoes', icon: Settings }
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="fixed inset-y-0 left-0 hidden w-72 flex-col justify-between border-r border-primary-800/40 bg-primary-900/90 p-6 text-primary-50 shadow-soft lg:flex">
      <div>
        <div className="mb-10 flex items-center gap-3 text-2xl font-semibold">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-600 text-white">CP</span>
          Controle Pessoal
        </div>
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <motion.div key={item.href} whileHover={{ scale: 1.02 }}>
                <Link
                  href={item.href}
                  className={cn(
                    'group relative flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition',
                    isActive
                      ? 'bg-white/10 text-white shadow-soft'
                      : 'text-primary-100 hover:bg-white/5 hover:text-white'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                  {isActive && <span className="absolute inset-y-1 right-2 rounded-full bg-white/20 px-2 text-xs">Ativo</span>}
                </Link>
              </motion.div>
            );
          })}
        </nav>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-xs text-white">
        <p className="font-semibold">Bem-vindo de volta!</p>
        <p>Gerencie finanças e saúde com indicadores sincronizados.</p>
      </div>
    </aside>
  );
}
