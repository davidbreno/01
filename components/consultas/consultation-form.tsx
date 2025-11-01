'use client';

import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { consultaFormSchema, ConsultaFormValues } from '@/lib/validations/consulta';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

type ConsultaStatus = ConsultaFormValues['status'];

type FormValues = ConsultaFormValues;

interface Option {
  id: string;
  label: string;
}

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
    control,
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
      lembreteAgendado: defaultValues?.lembreteAgendado
        ? new Date(defaultValues.lembreteAgendado).toISOString().slice(0, 16)
        : '',
      lembreteEnviado: defaultValues?.lembreteEnviado ?? false
    }
  });

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate aria-busy={submitting}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="pacienteId">Paciente</Label>
          <select
            id="pacienteId"
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
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
          <Label htmlFor="medicoId">Médico</Label>
          <select
            id="medicoId"
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
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
          <Input id="inicio" type="datetime-local" {...register('inicio')} />
          {errors.inicio ? <p className="text-xs text-destructive">{errors.inicio.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="fim">Fim</Label>
          <Input id="fim" type="datetime-local" {...register('fim')} />
          {errors.fim ? <p className="text-xs text-destructive">{errors.fim.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
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
      <div className="space-y-2">
        <Label htmlFor="notas">Notas</Label>
        <Textarea id="notas" rows={4} {...register('notas')} placeholder="Informações adicionais" />
      </div>
      <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
        <div className="space-y-2">
          <Label htmlFor="lembreteAgendado">Agendar lembrete</Label>
          <Input id="lembreteAgendado" type="datetime-local" {...register('lembreteAgendado')} />
          {errors.lembreteAgendado ? (
            <p className="text-xs text-destructive">{errors.lembreteAgendado.message as string}</p>
          ) : null}
        </div>
        <Controller
          control={control}
          name="lembreteEnviado"
          render={({ field }) => (
            <label className="flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm">
              <div>
                <span className="font-medium">Confirmar envio automático</span>
                <p className="text-xs text-muted-foreground">
                  Envia aviso por e-mail para o paciente na data selecionada.
                </p>
              </div>
              <Switch checked={field.value ?? false} onCheckedChange={field.onChange} />
            </label>
          )}
        />
      </div>
      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Salvando...
          </>
        ) : (
          'Salvar'
        )}
      </Button>
    </form>
  );
}

