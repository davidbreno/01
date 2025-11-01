import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/providers/theme-provider';
import { AuthProvider } from '@/providers/auth-provider';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Plataforma Dr. David — Odontologia Integrada',
  description:
    'Dashboard inteligente para gestão de pacientes, agenda, estoque e documentos da clínica Dr. David.',
  metadataBase: new URL('https://plataforma-drdavid.local'),
  openGraph: {
    title: 'Plataforma Dr. David',
    description:
      'Gestão odontológica com dashboards modernos, agenda sincronizada e armazenamento seguro de documentos.',
    siteName: 'Plataforma Dr. David',
    type: 'website'
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={cn(inter.variable, 'min-h-screen bg-background font-sans antialiased')}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem storageKey="plataforma-drdavid-theme">
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
