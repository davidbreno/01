'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

const schema = z.object({
  type: z.enum(['IN', 'OUT']),
  amount: z.coerce.number().positive(),
  categoryId: z.string(),
  date: z.string(),
  note: z.string().optional()
});

type FormValues = z.infer<typeof schema>;

type Category = { id: string; name: string; kind: 'IN' | 'OUT' };

type Props = {
  onSuccess?: () => void;
};

export function TransactionForm({ onSuccess }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: 'IN',
      date: new Date().toISOString().split('T')[0]
    }
  });

  const type = watch('type');

  useEffect(() => {
    fetch('/api/categories')
      .then((response) => response.json())
      .then((data) => setCategories(data));
  }, []);

  const onSubmit = handleSubmit(async (values) => {
    const response = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values)
    });
    if (response.ok) {
      reset({ ...values, amount: 0 });
      router.refresh();
      onSuccess?.();
    } else {
      alert('Erro ao salvar transação');
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nova transação</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span>Tipo</span>
            <select {...register('type')} className="rounded-2xl border border-grayui-100 px-3 py-2">
              <option value="IN">Entrada</option>
              <option value="OUT">Saída</option>
            </select>
          </label>
          <label className="space-y-1 text-sm">
            <span>Categoria</span>
            <select {...register('categoryId')} className="rounded-2xl border border-grayui-100 px-3 py-2">
              <option value="">Selecione</option>
              {categories
                .filter((category) => category.kind === type)
                .map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
            </select>
            {errors.categoryId && <span className="text-xs text-danger">Escolha uma categoria</span>}
          </label>
          <label className="space-y-1 text-sm">
            <span>Valor</span>
            <Input type="number" step="0.01" {...register('amount', { valueAsNumber: true })} />
            {errors.amount && <span className="text-xs text-danger">Valor inválido</span>}
          </label>
          <label className="space-y-1 text-sm">
            <span>Data</span>
            <Input type="date" {...register('date')} />
          </label>
          <label className="md:col-span-2 space-y-1 text-sm">
            <span>Observação</span>
            <Input {...register('note')} />
          </label>
          <div className="md:col-span-2">
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
