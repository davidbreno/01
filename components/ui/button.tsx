'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';

const buttonVariants = {
  default: 'bg-primary-600 hover:bg-primary-500 text-white shadow-soft rounded-2xl px-5 py-2 transition-all duration-200',
  outline: 'border border-primary-500 text-primary-500 hover:bg-primary-50 rounded-2xl px-5 py-2 transition-all duration-200',
  ghost: 'text-primary-600 hover:bg-primary-50 rounded-2xl px-5 py-2 duration-200'
};

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  variant?: keyof typeof buttonVariants;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return <Comp className={cn(buttonVariants[variant], className)} ref={ref} {...props} />;
  }
);
Button.displayName = 'Button';
