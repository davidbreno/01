'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const schema = z
  .object({
    name: z.string().min(3),
    startDate: z.string(),
    endDate: z.string(),
    notes: z.string().optional(),
    doses: z
      .array(
        z.object({
          compound: z.string().min(2),
          dosageMgPerWeek: z.coerce.number().int().positive(),
          scheduleJson: z.string().min(2)
        })
      )
      .min(2, 'Informe pelo menos dois compostos')
  })
  .refine((values) => new Date(values.startDate) <= new Date(values.endDate), {
    path: ['endDate'],
    message: 'Data final deve ser após a inicial'
  });

export type SteroidCycleFormValues = z.infer<typeof schema>;

export function SteroidCycleForm({ onSuccess }: { onSuccess?: () => void }) {
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm<SteroidCycleFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      doses: [
        { compound: '', dosageMgPerWeek: 0, scheduleJson: '' },
        { compound: '', dosageMgPerWeek: 0, scheduleJson: '' }
      ]
    }
  });

  const { fields, append, remove } = useFieldArray({ name: 'doses', control });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      const response = await fetch('/api/cycles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });
      if (!response.ok) {
        throw new Error('Erro ao salvar ciclo');
      }
      reset();
      router.refresh();
      onSuccess?.();
    } catch (error) {
      console.error(error);
      alert('Não foi possível salvar o ciclo');
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Novo ciclo</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="space-y-1 text-sm">
              <span>Nome</span>
              <Input {...register('name')} />
              {errors.name && <span className="text-xs text-danger">{errors.name.message}</span>}
            </label>
            <label className="space-y-1 text-sm">
              <span>Notas</span>
              <Input {...register('notes')} />
            </label>
            <label className="space-y-1 text-sm">
              <span>Início</span>
              <Input type="date" {...register('startDate')} />
              {errors.startDate && <span className="text-xs text-danger">Obrigatório</span>}
            </label>
            <label className="space-y-1 text-sm">
              <span>Fim</span>
              <Input type="date" {...register('endDate')} />
              {errors.endDate && <span className="text-xs text-danger">{errors.endDate.message}</span>}
            </label>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="font-semibold">Compostos</p>
              <Button type="button" variant="outline" onClick={() => append({ compound: '', dosageMgPerWeek: 0, scheduleJson: '' })}>
                Adicionar composto
              </Button>
            </div>
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-1 gap-3 rounded-xl border border-grayui-100 p-4 md:grid-cols-4 dark:border-grayui-700">
                <label className="space-y-1 text-sm">
                  <span>Composto</span>
                  <Input {...register(`doses.${index}.compound` as const)} />
                  {errors.doses?.[index]?.compound && (
                    <span className="text-xs text-danger">{errors.doses[index]?.compound?.message}</span>
                  )}
                </label>
                <label className="space-y-1 text-sm">
                  <span>Dosagem (mg/sem)</span>
                  <Input type="number" {...register(`doses.${index}.dosageMgPerWeek` as const, { valueAsNumber: true })} />
                  {errors.doses?.[index]?.dosageMgPerWeek && (
                    <span className="text-xs text-danger">Dosagem inválida</span>
                  )}
                </label>
                <label className="md:col-span-2 space-y-1 text-sm">
                  <span>Cronograma (JSON)</span>
                  <Input {...register(`doses.${index}.scheduleJson` as const)} placeholder='{"monday":"250mg"}' />
                  {errors.doses?.[index]?.scheduleJson && (
                    <span className="text-xs text-danger">{errors.doses[index]?.scheduleJson?.message}</span>
                  )}
                </label>
                {fields.length > 2 && (
                  <Button type="button" variant="ghost" onClick={() => remove(index)}>
                    Remover
                  </Button>
                )}
              </div>
            ))}
            {errors.doses && typeof errors.doses.message === 'string' && (
              <p className="text-xs text-danger">{errors.doses.message}</p>
            )}
          </div>
          <Button type="submit" disabled={submitting}>
            Salvar ciclo
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
