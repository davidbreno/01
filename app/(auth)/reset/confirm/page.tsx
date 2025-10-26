'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';

const schema = z
  .object({
    password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres'),
    confirmPassword: z.string().min(8)
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas precisam ser iguais',
    path: ['confirmPassword']
  });

type FormData = z.infer<typeof schema>;

export default function ResetConfirmPage() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get('token');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({ resolver: zodResolver(schema) });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: FormData) => {
    if (!token) {
      setError('Link inválido. Solicite uma nova recuperação.');
      return;
    }
    setError(null);
    setMessage(null);
    const response = await fetch('/api/auth/reset/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password: data.password })
    });
    const payload = await response.json();
    if (!response.ok) {
      setError(payload.error ?? 'Não foi possível redefinir a senha.');
      return;
    }
    setMessage('Senha redefinida com sucesso!');
    setTimeout(() => router.replace('/login?reset=success'), 1500);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Definir nova senha</h1>
        <p className="text-sm text-muted-foreground">Crie uma senha forte para continuar acessando o painel.</p>
      </div>
      {message ? <Alert tone="success" title={message} /> : null}
      {error ? <Alert tone="danger" title={error} /> : null}
      {!token ? (
        <Alert tone="danger" title="Link inválido" description="O token de recuperação não foi encontrado." />
      ) : (
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-2">
            <Label htmlFor="password">Nova senha</Label>
            <Input id="password" type="password" autoComplete="new-password" {...register('password')} />
            {errors.password ? <p className="text-xs text-destructive">{errors.password.message}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar senha</Label>
            <Input id="confirmPassword" type="password" autoComplete="new-password" {...register('confirmPassword')} />
            {errors.confirmPassword ? <p className="text-xs text-destructive">{errors.confirmPassword.message}</p> : null}
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando…' : 'Salvar nova senha'}
          </Button>
        </form>
      )}
      <div className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="font-medium text-primary">
          Voltar para o login
        </Link>
      </div>
    </div>
  );
}
