import * as React from 'react';
import { cn } from '@/lib/utils';

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-700 dark:bg-primary-700/30 dark:text-primary-200',
        className
      )}
      {...props}
    />
  );
}
