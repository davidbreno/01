'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

const schema = z.object({
  date: z.string(),
  ml: z.coerce.number().positive()
});

type FormValues = z.infer<typeof schema>;

type Props = {
  onSuccess?: () => void;
};

export function WaterForm({ onSuccess }: Props) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0]
    }
  });

  const onSubmit = handleSubmit(async (values) => {
    const response = await fetch('/api/water', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values)
    });
    if (response.ok) {
      reset({ ...values, ml: 0 });
      router.refresh();
      onSuccess?.();
    } else {
      alert('Erro ao registrar hidratação');
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrar hidratação</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span>Data</span>
            <Input type="date" {...register('date')} />
          </label>
          <label className="space-y-1 text-sm">
            <span>Quantidade (ml)</span>
            <Input type="number" {...register('ml', { valueAsNumber: true })} />
            {errors.ml && <span className="text-xs text-danger">Quantidade inválida</span>}
          </label>
          <div className="md:col-span-2">
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
