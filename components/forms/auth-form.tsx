'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const loginSchema = z.object({
  email: z.string().email({ message: 'Email inválido' }),
  password: z.string().min(6, 'Senha mínima de 6 caracteres')
});

const registerSchema = loginSchema.extend({
  name: z.string().min(3, 'Informe o nome')
});

type Mode = 'login' | 'register';

type AuthFormProps = {
  mode: Mode;
};

type FormValues = {
  name?: string;
  email: string;
  password: string;
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormValues>({
    resolver: zodResolver(mode === 'login' ? loginSchema : registerSchema)
  });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    setLoading(true);
    try {
      if (mode === 'register') {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values)
        });
        if (!response.ok) {
          throw new Error('Falha ao registrar');
        }
      }
      const result = await signIn('credentials', {
        email: values.email,
        password: values.password,
        redirect: false
      });
      if (result?.error) {
        setError('Credenciais inválidas');
      } else {
        router.push('/');
      }
    } catch (err) {
      console.error(err);
      setError('Ocorreu um erro');
    } finally {
      setLoading(false);
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {mode === 'register' && (
        <label className="space-y-1 text-sm text-grayui-600 dark:text-grayui-200">
          <span>Nome</span>
          <Input {...register('name')} placeholder="Seu nome" />
          {errors.name && <span className="text-xs text-danger">{errors.name.message}</span>}
        </label>
      )}
      <label className="space-y-1 text-sm text-grayui-600 dark:text-grayui-200">
        <span>Email</span>
        <Input type="email" {...register('email')} placeholder="voce@email.com" />
        {errors.email && <span className="text-xs text-danger">{errors.email.message}</span>}
      </label>
      <label className="space-y-1 text-sm text-grayui-600 dark:text-grayui-200">
        <span>Senha</span>
        <Input type="password" {...register('password')} placeholder="********" />
        {errors.password && <span className="text-xs text-danger">{errors.password.message}</span>}
      </label>
      {error && <p className="text-sm text-danger">{error}</p>}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Entrando...' : mode === 'login' ? 'Entrar' : 'Registrar'}
      </Button>
    </form>
  );
}
