import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Autenticação — Controle Pessoal'
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-900 via-primary-700 to-primary-500 p-6">
      <div className="w-full max-w-md rounded-2xl bg-white/90 p-8 shadow-soft backdrop-blur">
        <h1 className="mb-6 text-center text-2xl font-semibold text-primary-700">Controle Pessoal — by David</h1>
        {children}
      </div>
    </div>
  );
}
