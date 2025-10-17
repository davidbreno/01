import Link from 'next/link';
import { AuthForm } from '@/components/forms/auth-form';

export default function LoginPage() {
  return (
    <div className="space-y-4">
      <AuthForm mode="login" />
      <p className="text-center text-sm text-grayui-500">
        Novo por aqui?{' '}
        <Link href="/auth/register" className="text-primary-600">
          Crie sua conta
        </Link>
      </p>
    </div>
  );
}
