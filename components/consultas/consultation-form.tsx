'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { consultaFormSchema, ConsultaFormValues } from '@/lib/validations/consulta';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Option } from '@/lib/client/options';

type ConsultaStatus = ConsultaFormValues['status'];

type FormValues = ConsultaFormValues;

const statusOptions: Array<{ label: string; value: ConsultaStatus }> = [
  { label: 'Agendada', value: 'AGENDADA' },
  { label: 'Confirmada', value: 'CONFIRMADA' },
  { label: 'Cancelada', value: 'CANCELADA' },
  { label: 'Concluída', value: 'CONCLUIDA' }
];

export function ConsultationForm({
  defaultValues,
  onSubmit,
  submitting,
  patients,
  doctors
}: {
  defaultValues?: Partial<FormValues>;
  onSubmit: (values: FormValues) => Promise<void>;
  submitting?: boolean;
  patients: Option[];
  doctors: Option[];
}) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<FormValues>({
    resolver: zodResolver(consultaFormSchema),
    defaultValues: {
      pacienteId: defaultValues?.pacienteId ?? '',
      medicoId: defaultValues?.medicoId ?? '',
      inicio: defaultValues?.inicio ? new Date(defaultValues.inicio).toISOString().slice(0, 16) : '',
      fim: defaultValues?.fim ? new Date(defaultValues.fim).toISOString().slice(0, 16) : '',
      status: (defaultValues?.status as ConsultaStatus) ?? 'AGENDADA',
      notas: defaultValues?.notas ?? '',
      lembreteAtivo: defaultValues?.lembreteAtivo ?? true,
      lembreteAntecedenciaMinutos: defaultValues?.lembreteAntecedenciaMinutos
        ? String(defaultValues.lembreteAntecedenciaMinutos)
        : '30'
    }
  });
  const lembreteAtivo = watch('lembreteAtivo');

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate aria-busy={submitting}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="pacienteId">Paciente</Label>
          <select
            id="pacienteId"
            className="flex h-12 w-full rounded-xl border border-primary/20 bg-white/70 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 dark:bg-slate-900"
            {...register('pacienteId')}
          >
            <option value="">Selecione</option>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.label}
              </option>
            ))}
          </select>
          {errors.pacienteId ? <p className="text-xs text-destructive">{errors.pacienteId.message as string}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="medicoId">Profissional</Label>
          <select
            id="medicoId"
            className="flex h-12 w-full rounded-xl border border-primary/20 bg-white/70 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 dark:bg-slate-900"
            {...register('medicoId')}
          >
            <option value="">Selecione</option>
            {doctors.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.label}
              </option>
            ))}
          </select>
          {errors.medicoId ? <p className="text-xs text-destructive">{errors.medicoId.message as string}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="inicio">Início</Label>
          <Input
            id="inicio"
            type="datetime-local"
            className="h-12 rounded-xl border-primary/20 bg-white/80 shadow-sm focus-visible:ring-primary"
            {...register('inicio')}
          />
          {errors.inicio ? <p className="text-xs text-destructive">{errors.inicio.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="fim">Fim</Label>
          <Input
            id="fim"
            type="datetime-local"
            className="h-12 rounded-xl border-primary/20 bg-white/80 shadow-sm focus-visible:ring-primary"
            {...register('fim')}
          />
          {errors.fim ? <p className="text-xs text-destructive">{errors.fim.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            className="flex h-12 w-full rounded-xl border border-primary/20 bg-white/80 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 dark:bg-slate-900"
            {...register('status')}
          >
            {statusOptions.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid gap-4 rounded-3xl border border-primary/10 bg-primary/5 p-4 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <Label className="text-sm font-semibold text-primary">Lembrete inteligente</Label>
          <p className="mt-1 text-xs text-muted-foreground">
            Envie avisos automáticos antes do atendimento para garantir presença e preparo do paciente.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <label className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-primary/30 text-primary focus:ring-primary"
              {...register('lembreteAtivo')}
            />
            Ativar lembrete
          </label>
          <div
            className={cn('space-y-1 rounded-2xl border bg-white/80 p-3 text-xs shadow-sm transition-all', {
              'opacity-50 grayscale': !lembreteAtivo
            })}
          >
            <Label htmlFor="lembreteAntecedenciaMinutos" className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              minutos antes
            </Label>
            <Input
              id="lembreteAntecedenciaMinutos"
              type="number"
              min={5}
              max={2880}
              step={5}
              className="h-10 rounded-xl border-primary/20 bg-white/90 text-sm focus-visible:ring-primary"
              {...register('lembreteAntecedenciaMinutos')}
            />
            {errors.lembreteAntecedenciaMinutos ? (
              <p className="text-[11px] font-medium text-destructive">{errors.lembreteAntecedenciaMinutos.message}</p>
            ) : null}
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="notas">Notas clínicas</Label>
        <Textarea
          id="notas"
          rows={4}
          className="rounded-2xl border-primary/20 bg-white/70 focus-visible:ring-primary"
          {...register('notas')}
          placeholder="Informações complementares, observações ou preparos necessários"
        />
      </div>
      <Button
        type="submit"
        className="w-full rounded-2xl bg-gradient-to-r from-primary via-primary/90 to-accent text-base font-semibold shadow-lg shadow-primary/30 hover:scale-[1.01] hover:shadow-xl"
        disabled={submitting}
      >
        {submitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Salvando...
          </>
        ) : (
          'Salvar agenda'
        )}
      </Button>
    </form>
  );
}

