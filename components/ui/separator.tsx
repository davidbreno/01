import * as React from 'react';
import { cn } from '@/lib/utils';

const Separator = ({ className, orientation = 'horizontal', decorative = true, ...props }: React.HTMLAttributes<HTMLDivElement> & { orientation?: 'horizontal' | 'vertical'; decorative?: boolean }) => (
  <div
    role={decorative ? 'presentation' : 'separator'}
    aria-orientation={orientation}
    className={cn('bg-border', orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px', className)}
    {...props}
  />
);

export { Separator };
