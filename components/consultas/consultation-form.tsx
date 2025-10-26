'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { consultaSchema } from '@/lib/validations/consulta';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

type ConsultaStatus = 'AGENDADA' | 'CONFIRMADA' | 'CANCELADA' | 'CONCLUIDA';

const formSchema = consultaSchema.extend({
  inicio: z.string().min(1),
  fim: z.string().min(1),
  status: z.enum(['AGENDADA', 'CONFIRMADA', 'CANCELADA', 'CONCLUIDA'])
});

type FormValues = z.infer<typeof formSchema>;

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
    formState: { errors }
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pacienteId: defaultValues?.pacienteId ?? '',
      medicoId: defaultValues?.medicoId ?? '',
      inicio: defaultValues?.inicio ? new Date(defaultValues.inicio).toISOString().slice(0, 16) : '',
      fim: defaultValues?.fim ? new Date(defaultValues.fim).toISOString().slice(0, 16) : '',
      status: (defaultValues?.status as ConsultaStatus) ?? 'AGENDADA',
      notas: defaultValues?.notas ?? ''
    }
  });

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
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
      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? 'Salvando…' : 'Salvar'}
      </Button>
    </form>
  );
}
