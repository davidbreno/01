'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

const schema = z.object({
  title: z.string().min(3),
  amount: z.coerce.number().positive(),
  dueDate: z.string(),
  status: z.enum(['PENDING', 'PAID']).default('PENDING')
});

type FormValues = z.infer<typeof schema>;

type Props = {
  onSuccess?: () => void;
};

export function BillForm({ onSuccess }: Props) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      status: 'PENDING',
      dueDate: new Date().toISOString().split('T')[0]
    }
  });

  const onSubmit = handleSubmit(async (values) => {
    const response = await fetch('/api/bills', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values)
    });
    if (response.ok) {
      reset({ ...values, title: '', amount: 0 });
      router.refresh();
      onSuccess?.();
    } else {
      alert('Erro ao salvar conta');
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nova conta</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span>Título</span>
            <Input {...register('title')} />
            {errors.title && <span className="text-xs text-danger">Informe o título</span>}
          </label>
          <label className="space-y-1 text-sm">
            <span>Valor</span>
            <Input type="number" step="0.01" {...register('amount', { valueAsNumber: true })} />
          </label>
          <label className="space-y-1 text-sm">
            <span>Vencimento</span>
            <Input type="date" {...register('dueDate')} />
          </label>
          <label className="space-y-1 text-sm">
            <span>Status</span>
            <select {...register('status')} className="rounded-2xl border border-grayui-100 px-3 py-2">
              <option value="PENDING">Pendente</option>
              <option value="PAID">Paga</option>
            </select>
          </label>
          <div className="md:col-span-2">
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
