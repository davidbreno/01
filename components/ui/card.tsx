import * as React from 'react';
import { cn } from '@/lib/utils';

export type CardProps = React.HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: CardProps) {
  return <div className={cn('rounded-xl bg-white/80 p-6 shadow-soft backdrop-blur dark:bg-grayui-800/80', className)} {...props} />;
}

export function CardHeader({ className, ...props }: CardProps) {
  return <div className={cn('mb-4 flex items-center justify-between gap-4', className)} {...props} />;
}

export function CardTitle({ className, ...props }: CardProps) {
  return <h3 className={cn('text-lg font-semibold text-grayui-900 dark:text-grayui-50', className)} {...props} />;
}

export function CardContent({ className, ...props }: CardProps) {
  return <div className={cn('space-y-4', className)} {...props} />;
}
