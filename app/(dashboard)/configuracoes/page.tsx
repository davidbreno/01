'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';

const densityOptions = [
  { label: 'Confortável', value: 'comfortable' },
  { label: 'Compacto', value: 'compact' }
] as const;

type Density = (typeof densityOptions)[number]['value'];

export default function ConfiguracoesPage() {
  const { theme, setTheme } = useTheme();
  const [density, setDensity] = useState<Density>(() => {
    if (typeof window === 'undefined') return 'comfortable';
    return (localStorage.getItem('drdavid-density') as Density) || 'comfortable';
  });
  const [animations, setAnimations] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem('drdavid-animations') !== 'off';
  });
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.dataset.density = density;
    localStorage.setItem('drdavid-density', density);
  }, [density]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.dataset.animations = animations ? 'on' : 'off';
    localStorage.setItem('drdavid-animations', animations ? 'on' : 'off');
  }, [animations]);

  return (
    <div className="space-y-8 text-emerald-50">
      <header className="rounded-3xl border border-white/10 bg-gradient-to-r from-emerald-500/20 via-purple-500/10 to-slate-900/60 p-8 shadow-lg shadow-purple-500/10">
        <p className="text-sm uppercase tracking-[0.3em] text-emerald-200/70">Personalização</p>
        <h1 className="mt-3 text-3xl font-semibold">Configurações do painel</h1>
        <p className="mt-4 max-w-3xl text-sm text-emerald-100/70">
          Ajuste tema, densidade e animações da experiência Dr. David. Todas as preferências são salvas localmente para cada
          usuário.
        </p>
      </header>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-4 rounded-3xl border border-white/10 bg-black/30 p-6">
          <h2 className="text-lg font-semibold text-white">Tema</h2>
          <p className="text-xs text-emerald-200/60">Alterne entre modo claro e escuro em tempo real.</p>
          <div className="flex flex-col gap-3">
            <Button
              type="button"
              variant={theme === 'dark' ? 'default' : 'outline'}
              className="justify-start bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/30"
              onClick={() => setTheme('dark')}
            >
              Ativar modo escuro
            </Button>
            <Button
              type="button"
              variant={theme === 'light' ? 'default' : 'outline'}
              className="justify-start bg-white/10 text-emerald-100 hover:bg-white/20"
              onClick={() => setTheme('light')}
            >
              Ativar modo claro
            </Button>
            <Button
              type="button"
              variant={theme === 'system' ? 'default' : 'outline'}
              className="justify-start bg-white/5 text-emerald-100 hover:bg-white/15"
              onClick={() => setTheme('system')}
            >
              Seguir sistema operacional
            </Button>
          </div>
        </section>
        <section className="space-y-4 rounded-3xl border border-white/10 bg-black/30 p-6">
          <h2 className="text-lg font-semibold text-white">Densidade</h2>
          <p className="text-xs text-emerald-200/60">Escolha o espaçamento padrão dos componentes.</p>
          <div className="flex gap-3">
            {densityOptions.map((option) => (
              <Button
                key={option.value}
                type="button"
                variant={density === option.value ? 'default' : 'outline'}
                className="flex-1 justify-center bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/30"
                onClick={() => setDensity(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
          <p className="text-xs text-emerald-200/50">Modo compacto reduz margens e alturas de tabelas e formulários.</p>
        </section>
        <section className="space-y-4 rounded-3xl border border-white/10 bg-black/30 p-6">
          <h2 className="text-lg font-semibold text-white">Animações</h2>
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/40 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-white">Animações suaves</p>
              <p className="text-xs text-emerald-200/60">Desative se preferir uma interface mais estática.</p>
            </div>
            <Switch checked={animations} onCheckedChange={(checked) => setAnimations(checked)} />
          </div>
        </section>
        <section className="space-y-4 rounded-3xl border border-white/10 bg-black/30 p-6">
          <h2 className="text-lg font-semibold text-white">Reset de preferências</h2>
          <p className="text-xs text-emerald-200/60">
            Volte rapidamente para a configuração padrão da plataforma Dr. David.
          </p>
          <Button
            type="button"
            variant="outline"
            className="bg-red-500/10 text-red-200 hover:bg-red-500/20"
            onClick={() => {
              setTheme('dark');
              setDensity('comfortable');
              setAnimations(true);
              localStorage.removeItem('plataforma-drdavid-theme');
              localStorage.removeItem('drdavid-density');
              localStorage.removeItem('drdavid-animations');
              setMessage('Preferências restauradas.');
              setTimeout(() => setMessage(null), 4000);
            }}
          >
            Restaurar padrão
          </Button>
          {message ? <Alert tone="success" title={message} /> : null}
        </section>
      </div>
    </div>
  );
}
