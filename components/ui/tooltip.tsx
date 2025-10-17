'use client';

import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <TooltipPrimitive.Provider delayDuration={200}>{children}</TooltipPrimitive.Provider>;
}

export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;

export function TooltipContent({ children }: { children: React.ReactNode }) {
  return (
    <TooltipPrimitive.Content className="rounded-lg bg-grayui-900 px-3 py-1.5 text-xs text-white shadow-soft">
      {children}
      <TooltipPrimitive.Arrow className="fill-grayui-900" />
    </TooltipPrimitive.Content>
  );
}
