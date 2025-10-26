'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { pacienteSchema } from '@/lib/validations/paciente';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

const formSchema = pacienteSchema.extend({
  nascimento: z.string().min(1)
});

type FormValues = z.infer<typeof formSchema>;

const sexOptions = [
  { label: 'Feminino', value: 'FEMININO' },
  { label: 'Masculino', value: 'MASCULINO' },
  { label: 'Outro', value: 'OUTRO' }
];

export function PatientForm({
  defaultValues,
  onSubmit,
  submitting
}: {
  defaultValues?: Partial<FormValues>;
  onSubmit: (values: FormValues) => Promise<void>;
  submitting?: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: defaultValues?.nome ?? '',
      cpf: defaultValues?.cpf ?? '',
      nascimento: defaultValues?.nascimento
        ? new Date(defaultValues.nascimento).toISOString().slice(0, 10)
        : '',
      sexo: defaultValues?.sexo ?? 'FEMININO',
      telefone: defaultValues?.telefone ?? '',
      email: defaultValues?.email ?? '',
      endereco: defaultValues?.endereco ?? '',
      convenio: defaultValues?.convenio ?? '',
      carteirinha: defaultValues?.carteirinha ?? '',
      alergias: defaultValues?.alergias ?? '',
      observacoes: defaultValues?.observacoes ?? ''
    }
  });

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate aria-busy={submitting}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="nome">Nome completo</Label>
          <Input id="nome" {...register('nome')} />
          {errors.nome ? <p className="text-xs text-destructive">{errors.nome.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="cpf">CPF</Label>
          <Input id="cpf" {...register('cpf')} placeholder="Somente números" />
          {errors.cpf ? <p className="text-xs text-destructive">{errors.cpf.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="nascimento">Nascimento</Label>
          <Input id="nascimento" type="date" {...register('nascimento')} />
          {errors.nascimento ? <p className="text-xs text-destructive">{errors.nascimento.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="sexo">Sexo</Label>
          <select
            id="sexo"
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
            {...register('sexo')}
          >
            {sexOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.sexo ? <p className="text-xs text-destructive">{errors.sexo.message as string}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="telefone">Telefone</Label>
          <Input id="telefone" {...register('telefone')} placeholder="(00) 00000-0000" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" type="email" {...register('email')} placeholder="paciente@exemplo.com" />
          {errors.email ? <p className="text-xs text-destructive">{errors.email.message}</p> : null}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="endereco">Endereço</Label>
          <Input id="endereco" {...register('endereco')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="convenio">Convênio / Plano</Label>
          <Input id="convenio" {...register('convenio')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="carteirinha">Nº carteirinha</Label>
          <Input id="carteirinha" {...register('carteirinha')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="alergias">Alergias</Label>
          <Input id="alergias" {...register('alergias')} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea id="observacoes" rows={4} {...register('observacoes')} />
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
