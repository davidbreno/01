import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Entrar — Clínica Prisma',
  description: 'Acesse o painel de pacientes da Clínica Prisma.'
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/20 px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border bg-card/80 p-10 shadow-xl backdrop-blur">
        {children}
      </div>
    </div>
  );
}
