import Link from 'next/link';
import { AuthForm } from '@/components/forms/auth-form';

export default function RegisterPage() {
  return (
    <div className="space-y-4">
      <AuthForm mode="register" />
      <p className="text-center text-sm text-grayui-500">
        Já possui conta?{' '}
        <Link href="/auth/login" className="text-primary-600">
          Entrar
        </Link>
      </p>
    </div>
  );
}
