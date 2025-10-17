'use client';

import { Sidebar } from './sidebar';
import { Topbar } from './topbar';
import { motion } from 'framer-motion';

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-600">
      <Sidebar />
      <main className="flex-1 bg-gradient-to-br from-primary-50/95 via-white/90 to-primary-50/95 p-6 lg:ml-72 dark:from-grayui-900/95 dark:via-grayui-900/80 dark:to-grayui-900/95">
        <div className="mx-auto max-w-[1400px] space-y-6">
          <Topbar />
          <motion.section
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0, y: 16 },
              show: { opacity: 1, y: 0, transition: { staggerChildren: 0.05 } }
            }}
            className="grid grid-cols-1 gap-6 lg:grid-cols-12"
          >
            {children}
          </motion.section>
        </div>
      </main>
    </div>
  );
}
