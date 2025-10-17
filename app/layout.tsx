import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/providers/theme-provider';
import { AuthProvider } from '@/providers/auth-provider';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Controle Pessoal — by David',
  description: 'Dashboard integrado de finanças e saúde com Next.js'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={cn(
          inter.variable,
          'min-h-screen bg-grayui-50 text-grayui-900 transition-colors duration-300 dark:bg-grayui-900 dark:text-grayui-50'
        )}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} storageKey="controle-pessoal-theme">
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
