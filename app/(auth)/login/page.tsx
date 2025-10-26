'use client';

import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
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

  const onSubmit = async (data: FormData) => {
    setError(null);
    const result = await signIn('credentials', { redirect: false, ...data });
    if (result?.error) {
      setError('Credenciais inválidas. Verifique seu e-mail e senha.');
      return;
    }
    router.replace('/dashboard');
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2 text-left">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Acesse a Clínica Prisma</h1>
        <p className="text-sm text-muted-foreground">Use o e-mail corporativo para entrar no painel de pacientes.</p>
      </div>
      {resetSuccess ? <Alert tone="success" title="Senha atualizada" description="Faça login com a nova senha." /> : null}
      {error ? <Alert tone="danger" title={error} /> : null}
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" type="email" autoComplete="email" placeholder="nome@clinica.com" {...register('email')} />
          {errors.email ? <p className="text-xs text-destructive">{errors.email.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <Input id="password" type="password" autoComplete="current-password" placeholder="••••••••" {...register('password')} />
          {errors.password ? <p className="text-xs text-destructive">{errors.password.message}</p> : null}
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Entrando…' : 'Entrar'}
        </Button>
      </form>
      <div className="text-center text-sm text-muted-foreground">
        <Link href="/reset" className="font-medium text-primary">
          Esqueci minha senha
        </Link>
      </div>
    </div>
  );
}
