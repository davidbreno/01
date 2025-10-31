'use client';

import { useEffect, useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';

const schema = z.object({
  email: z.string().email('Informe um e-mail válido'),
  password: z.string().min(6, 'Informe a senha')
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const resetSuccess = params.get('reset');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({ resolver: zodResolver(schema) });
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 120);
    return () => clearTimeout(timer);
  }, []);

  const onSubmit = async (data: FormData) => {
    setError(null);
    let callbackUrl = params.get('callbackUrl') ?? '';
    try {
      let prev: string | null = null;
      while (callbackUrl && callbackUrl.includes('%25') && callbackUrl !== prev) {
        prev = callbackUrl;
        callbackUrl = decodeURIComponent(callbackUrl);
      }
    } catch (decodeError) {
      console.warn('Não foi possível decodificar callbackUrl', decodeError);
    }

    const result = await signIn('credentials', { redirect: false, ...data, callbackUrl: callbackUrl || undefined });
    if (result?.error) {
      setError('Credenciais inválidas. Verifique seu e-mail e senha.');
      return;
    }

    router.replace(callbackUrl || '/dashboard');
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-surface-50 via-background to-surface-200">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 opacity-70 blur-3xl">
          <div className="animate-float absolute -left-20 top-16 h-64 w-64 rounded-full bg-primary/30" />
          <div className="animate-float-delayed absolute bottom-10 right-0 h-72 w-72 rounded-full bg-accent/20" />
        </div>
      </div>
      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-4 py-12 lg:flex-row lg:items-center lg:px-12">
        <div
          className={`flex-1 space-y-8 rounded-[32px] border border-white/10 bg-white/60 p-10 shadow-2xl backdrop-blur-xl transition-all duration-700 ease-out dark:border-white/5 dark:bg-slate-950/40 lg:mr-8 ${
            mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          <div className="flex flex-col gap-3">
            <span className="w-fit rounded-full bg-primary/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-primary/90">
              Dr. David Experience
            </span>
            <h1 className="text-4xl font-semibold text-foreground lg:text-5xl">Bem-vindo à plataforma odontológica</h1>
            <p className="max-w-xl text-base text-muted-foreground">
              Centralize pacientes, agenda, documentos e estoque em um só painel com identidade premium e animações suaves.
              Gerencie a clínica do Dr. David com inteligência e clareza.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {[
              {
                title: 'Dashboard responsivo',
                description: 'Resumo clínico com indicadores e insights em tempo real.'
              },
              {
                title: 'Pacientes conectados',
                description: 'Histórico clínico completo, anamnese personalizável e anexos organizados.'
              },
              {
                title: 'Agenda integrada',
                description: 'Sincronize consultas, ative lembretes inteligentes e confirme presença.'
              },
              {
                title: 'Estoque visual',
                description: 'Controle implantes CMI, HE e HI Tapa com fotos e rastreabilidade.'
              }
            ].map((feature) => (
              <div key={feature.title} className="rounded-2xl border border-primary/15 bg-primary/5 p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-primary">{feature.title}</h3>
                <p className="mt-2 text-xs text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
        <div
          className={`mt-12 flex w-full max-w-md flex-col rounded-[28px] border border-white/10 bg-white/70 p-10 shadow-2xl backdrop-blur-xl transition-all duration-700 ease-out dark:border-white/5 dark:bg-slate-950/70 lg:mt-0 ${
            mounted ? 'translate-y-0 opacity-100 delay-150' : 'translate-y-6 opacity-0'
          }`}
        >
          <div className="space-y-2 text-left">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">Acesse sua conta</h2>
            <p className="text-sm text-muted-foreground">
              Utilize as credenciais fornecidas pela equipe para entrar no painel do Dr. David.
            </p>
          </div>
          {resetSuccess ? <Alert tone="success" title="Senha atualizada" description="Faça login com a nova senha." /> : null}
          {error ? <Alert tone="danger" title={error} /> : null}
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail corporativo</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="nome@clínica.com"
                className="h-12 rounded-xl border-primary/20 bg-white/60 placeholder:text-muted-foreground/70 focus-visible:ring-primary"
                {...register('email')}
              />
              {errors.email ? <p className="text-xs text-destructive">{errors.email.message}</p> : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                className="h-12 rounded-xl border-primary/20 bg-white/60 focus-visible:ring-primary"
                {...register('password')}
              />
              {errors.password ? <p className="text-xs text-destructive">{errors.password.message}</p> : null}
            </div>
            <Button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-primary via-primary/90 to-accent text-base font-semibold shadow-lg shadow-primary/30 transition hover:scale-[1.01] hover:shadow-xl"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Entrando…' : 'Entrar na plataforma'}
            </Button>
          </form>
          <div className="pt-6 text-center text-sm text-muted-foreground">
            <Link href="/reset" className="font-medium text-primary">
              Esqueci minha senha
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
