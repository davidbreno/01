'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';

const schema = z.object({
  email: z.string().email('Informe o e-mail cadastrado')
});

type FormData = z.infer<typeof schema>;

export default function ResetPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({ resolver: zodResolver(schema) });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: FormData) => {
    setMessage(null);
    setError(null);
    const response = await fetch('/api/auth/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const payload = await response.json();
    if (!response.ok) {
      setError(payload.error ?? 'Não foi possível gerar o link de recuperação.');
      return;
    }
    setMessage(payload.message ?? 'Enviamos um e-mail com o link de redefinição.');
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Recuperar senha</h1>
        <p className="text-sm text-muted-foreground">Informe o e-mail para receber o link de redefinição de senha.</p>
      </div>
      {message ? <Alert tone="success" title={message} /> : null}
      {error ? <Alert tone="danger" title={error} /> : null}
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" type="email" placeholder="nome@clinica.com" {...register('email')} />
          {errors.email ? <p className="text-xs text-destructive">{errors.email.message}</p> : null}
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Enviando…' : 'Enviar link'}
        </Button>
      </form>
      <div className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="font-medium text-primary">
          Voltar para o login
        </Link>
      </div>
    </div>
  );
}
