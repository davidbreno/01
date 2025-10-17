'use client';

import { AlertTriangle, Droplets, Scale, BellRing } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export type AlertBannerProps = {
  messages: Array<{
    id: string;
    title: string;
    description: string;
    tone: 'warning' | 'danger' | 'info';
    icon?: 'alert' | 'water' | 'weight' | 'bell';
  }>;
};

const toneMap = {
  warning: 'border-warning/50 bg-warning/15 text-warning',
  danger: 'border-danger/50 bg-danger/15 text-danger',
  info: 'border-primary-500/40 bg-primary-500/10 text-primary-700'
};

const iconMap = {
  alert: AlertTriangle,
  water: Droplets,
  weight: Scale,
  bell: BellRing
};

export function AlertBanner({ messages }: AlertBannerProps) {
  if (messages.length === 0) return null;
  return (
    <div className="col-span-12 space-y-3">
      {messages.map((message) => {
        const Icon = iconMap[message.icon ?? 'alert'];
        return (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn('flex items-start gap-3 rounded-xl border px-4 py-3 text-sm', toneMap[message.tone])}
          >
            <Icon className="mt-1 h-5 w-5" />
            <div>
              <p className="font-semibold">{message.title}</p>
              <p className="text-xs opacity-80">{message.description}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
