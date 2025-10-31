'use client';

import { useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import { Monitor, Moon, Palette, Sparkles, Sun, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Alert, type AlertTone } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import {
  applyAppearancePreferences,
  DEFAULT_APPEARANCE,
  loadAppearancePreferences,
  persistAppearancePreferences,
  type AccentPreset,
  type AppearancePreferences,
  type DensityPreset,
  type MotionPreset
} from '@/lib/client/appearance';

const ACCENT_OPTIONS: Array<{
  value: AccentPreset;
  label: string;
  description: string;
  gradient: string;
}> = [
  {
    value: 'ocean',
    label: 'Oceano clínico',
    description: 'Azuis e verdes sofisticados do tema Dr. David.',
    gradient: 'from-sky-500 via-cyan-500 to-emerald-400'
  },
  {
    value: 'violet',
    label: 'Violeta premium',
    description: 'Tons violeta e fúcsia para um visual futurista.',
    gradient: 'from-fuchsia-500 via-purple-500 to-indigo-500'
  },
  {
    value: 'sunrise',
    label: 'Amanhecer solar',
    description: 'Laranja e âmbar que remetem a conforto e energia.',
    gradient: 'from-amber-400 via-orange-500 to-rose-500'
  }
];

const DENSITY_OPTIONS: Array<{
  value: DensityPreset;
  label: string;
  description: string;
}> = [
  {
    value: 'comfortable',
    label: 'Confortável',
    description: 'Espaçamentos amplos para leitura relaxada em telas grandes.'
  },
  {
    value: 'compact',
    label: 'Compacto',
    description: 'Reduz margens e bordas para caber mais dados na mesma área.'
  }
];

type ThemeChoice = 'light' | 'dark' | 'system';

const THEME_OPTIONS: Array<{
  value: ThemeChoice;
  label: string;
  icon: typeof Sun;
}> = [
  { value: 'light', label: 'Claro', icon: Sun },
  { value: 'dark', label: 'Escuro', icon: Moon },
  { value: 'system', label: 'Automático', icon: Monitor }
];

export default function ConfiguracoesPage() {
  const { theme, setTheme } = useTheme();
  const [appearance, setAppearance] = useState<AppearancePreferences>(DEFAULT_APPEARANCE);
  const [mounted, setMounted] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [tone, setTone] = useState<AlertTone>('info');
  const hydrationRef = useRef(false);
  const timeoutRef = useRef<number | null>(null);

  const showMessage = (text: string, alertTone: AlertTone = 'info', duration = 2600) => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    setMessage(text);
    setTone(alertTone);
    timeoutRef.current = window.setTimeout(() => {
      setMessage(null);
      timeoutRef.current = null;
    }, duration) as unknown as number;
  };

  useEffect(() => {
    const prefs = loadAppearancePreferences();
    setAppearance(prefs);
    applyAppearancePreferences(prefs);
    setMounted(true);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!mounted) {
      return;
    }
    if (!hydrationRef.current) {
      hydrationRef.current = true;
      return;
    }
    persistAppearancePreferences(appearance);
    applyAppearancePreferences(appearance);
    showMessage('Preferências visuais atualizadas.', 'success');
  }, [appearance, mounted]);

  const handleThemeChange = (value: ThemeChoice) => {
    setTheme(value);
    showMessage(
      value === 'system'
        ? 'Tema automático sincronizado com o sistema.'
        : `Tema ${value === 'light' ? 'claro' : 'escuro'} aplicado.`,
      'success'
    );
  };

  const handleReset = () => {
    setAppearance(DEFAULT_APPEARANCE);
    setTheme('system');
    applyAppearancePreferences(DEFAULT_APPEARANCE);
    persistAppearancePreferences(DEFAULT_APPEARANCE);
    showMessage('Configurações restauradas para o padrão Dr. David.', 'info');
  };

  const activeTheme = (theme ?? 'system') as ThemeChoice;

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-white/10 bg-white/75 p-6 shadow-xl shadow-primary/10 backdrop-blur dark:bg-slate-950/70">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-primary/70">Painel de identidade</p>
            <h1 className="text-3xl font-semibold text-foreground">Ajustes avançados da experiência Dr. David</h1>
            <p className="text-sm text-muted-foreground">
              Escolha o tema, personalize cores de destaque, defina densidade da interface e controle animações do dashboard.
            </p>
          </div>
          <Button variant="outline" onClick={handleReset} className="rounded-2xl border-primary/30 bg-primary/5 text-primary hover:bg-primary/10">
            Restaurar padrão
          </Button>
        </div>
        {message ? <Alert tone={tone} title={message} className="mt-4" /> : null}
      </div>

      <section className="rounded-3xl border border-white/10 bg-white/70 p-6 shadow-inner shadow-primary/10 backdrop-blur dark:bg-slate-950/70">
        <h2 className="text-lg font-semibold text-foreground">Modo de cor</h2>
        <p className="text-sm text-muted-foreground">
          Alterne entre tema claro, escuro ou siga o padrão do sistema operacional.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
            <Button
              key={value}
              type="button"
              onClick={() => handleThemeChange(value)}
              variant={activeTheme === value ? 'default' : 'outline'}
              className={cn(
                'flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition',
                activeTheme === value
                  ? 'bg-gradient-to-r from-primary via-primary/90 to-accent text-white shadow-lg shadow-primary/30'
                  : 'border-primary/20 bg-white/70 text-muted-foreground hover:border-primary/40'
              )}
            >
              <Icon className="h-4 w-4" /> {label}
            </Button>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/70 p-6 shadow-inner shadow-primary/10 backdrop-blur dark:bg-slate-950/70">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Paleta de destaque</h2>
            <p className="text-sm text-muted-foreground">
              Defina a identidade cromática que se propaga por botões, gráficos e gradientes decorativos.
            </p>
          </div>
          <Palette className="h-6 w-6 text-primary" />
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {ACCENT_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setAppearance((prev) => ({ ...prev, accent: option.value }))}
              className={cn(
                'group flex flex-col gap-3 rounded-3xl border bg-white/80 p-4 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:bg-slate-900/70',
                appearance.accent === option.value ? 'border-primary/50 shadow-primary/20' : 'border-white/20'
              )}
              aria-pressed={appearance.accent === option.value}
            >
              <div className={cn('h-20 w-full rounded-2xl bg-gradient-to-r shadow-inner shadow-black/10', option.gradient)} />
              <div>
                <p className="text-sm font-semibold text-foreground">{option.label}</p>
                <p className="text-xs text-muted-foreground">{option.description}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/70 p-6 shadow-inner shadow-primary/10 backdrop-blur dark:bg-slate-950/70">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Densidade e animações</h2>
            <p className="text-sm text-muted-foreground">
              Ajuste a proximidade dos elementos e determine como a interface se movimenta.
            </p>
          </div>
          <Sparkles className="h-6 w-6 text-primary" />
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="space-y-3 rounded-3xl border border-white/20 bg-white/80 p-4 shadow-sm dark:bg-slate-900/70">
            <h3 className="text-sm font-semibold text-foreground">Densidade de layout</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {DENSITY_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  onClick={() => setAppearance((prev) => ({ ...prev, density: option.value }))}
                  variant={appearance.density === option.value ? 'default' : 'outline'}
                  className={cn(
                    'rounded-2xl px-4 py-2 text-xs font-semibold',
                    appearance.density === option.value
                      ? 'bg-gradient-to-r from-primary via-primary/90 to-accent text-white shadow-primary/30'
                      : 'border-primary/20 bg-white/70 text-muted-foreground hover:border-primary/40'
                  )}
                >
                  {option.label}
                </Button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {DENSITY_OPTIONS.find((option) => option.value === appearance.density)?.description}
            </p>
          </div>
          <div className="space-y-4 rounded-3xl border border-white/20 bg-white/80 p-4 shadow-sm dark:bg-slate-900/70">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-foreground">Reduzir animações</p>
                <p className="text-xs text-muted-foreground">
                  Ideal para apresentações formais ou dispositivos com desempenho limitado.
                </p>
              </div>
              <Switch
                id="motion-toggle"
                checked={appearance.motion === 'reduced'}
                onCheckedChange={(checked) =>
                  setAppearance((prev) => ({ ...prev, motion: (checked ? 'reduced' : 'full') as MotionPreset }))
                }
              />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-foreground">Vidro e desfoques</p>
                <p className="text-xs text-muted-foreground">
                  Ative o efeito glassmorphism característico ou simplifique com superfícies sólidas.
                </p>
              </div>
              <Switch
                id="glass-toggle"
                checked={appearance.glass}
                onCheckedChange={(checked) => setAppearance((prev) => ({ ...prev, glass: Boolean(checked) }))}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/70 p-6 shadow-inner shadow-primary/10 backdrop-blur dark:bg-slate-950/70">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Notas rápidas</h2>
            <p className="text-sm text-muted-foreground">
              As preferências ficam salvas no navegador e acompanham o usuário ao retornar para o painel.
            </p>
          </div>
          <Wand2 className="h-6 w-6 text-primary" />
        </div>
        <ul className="mt-4 list-disc space-y-2 pl-6 text-sm text-muted-foreground">
          <li>O modo compacto reduz o raio das bordas e o espaçamento interno de cartões automaticamente.</li>
          <li>Com animações reduzidas, botões e cards mantêm transições suaves em 120ms e desativam flutuações decorativas.</li>
          <li>Ao desativar vidro e desfoques, a plataforma utiliza fundos sólidos para maior contraste em projetores.</li>
        </ul>
      </section>
    </div>
  );
}
