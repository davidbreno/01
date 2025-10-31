import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/providers/theme-provider';
import { AuthProvider } from '@/providers/auth-provider';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta'
});

export const metadata: Metadata = {
  title: 'Dr. David — Plataforma Odontológica Inteligente',
  description:
    'Painel unificado com pacientes, agenda, documentos, anamnese e estoque para a clínica do Dr. David.',
  metadataBase: new URL('https://dr-david-clinica.local')
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={cn(
          plusJakarta.variable,
          'min-h-screen bg-gradient-to-br from-surface-50 via-background to-surface-100 font-sans antialiased'
        )}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="clinica-prisma-theme">
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
