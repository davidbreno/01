import * as React from 'react';
import { cn } from '@/lib/utils';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'w-full rounded-2xl border border-grayui-100 bg-white/70 px-4 py-2 text-sm shadow-sm transition focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-grayui-700 dark:bg-grayui-800/80',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';
