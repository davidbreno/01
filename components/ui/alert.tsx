import { cn } from '@/lib/utils';
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';

const toneIcon = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: AlertTriangle
};

export type AlertTone = keyof typeof toneIcon;

export function Alert({ title, description, tone = 'info', className }: { title: string; description?: string; tone?: AlertTone; className?: string }) {
  const Icon = toneIcon[tone];
  return (
    <div role="status" aria-live="polite" className={cn('flex w-full items-start gap-3 rounded-xl border px-4 py-3', className)} data-tone={tone}>
      <Icon className={cn('mt-1 h-4 w-4', tone === 'danger' ? 'text-destructive' : tone === 'warning' ? 'text-amber-500' : 'text-primary')} />
      <div className="space-y-1">
        <p className="text-sm font-semibold leading-tight">{title}</p>
        {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
      </div>
    </div>
  );
}
