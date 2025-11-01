'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { materialSchema, type MaterialFormValues } from '@/lib/validations/estoque';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

async function fetchMaterials() {
  const response = await fetch('/api/estoque/materiais');
  if (!response.ok) {
    throw new Error('Não foi possível carregar os materiais.');
  }
  return (await response.json()) as Array<MaterialFormValues & { id: string }>;
}

export function MaterialPanel() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({ queryKey: ['materials'], queryFn: fetchMaterials });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<MaterialFormValues>({
    resolver: zodResolver(materialSchema),
    defaultValues: {
      nome: '',
      marca: '',
      unidade: '',
      quantidade: 0,
      descricao: ''
    }
  });

  const onSubmit = async (values: MaterialFormValues) => {
    setFormError(null);
    setSubmitting(true);
    try {
      const response = await fetch('/api/estoque/materiais', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          marca: values.marca || null,
          descricao: values.descricao || null,
          quantidade: Number(values.quantidade)
        })
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error ?? 'Erro ao registrar material');
      }
      reset({ nome: '', marca: '', unidade: values.unidade, quantidade: 0, descricao: '' });
      await queryClient.invalidateQueries({ queryKey: ['materials'] });
    } catch (error: any) {
      setFormError(error.message ?? 'Erro inesperado');
    } finally {
      setSubmitting(false);
    }
  };

  const adjustQuantity = async (item: any, delta: number) => {
    try {
      setFormError(null);
      const response = await fetch(`/api/estoque/materiais/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: item.nome,
          marca: item.marca,
          unidade: item.unidade,
          quantidade: Math.max(0, Number(item.quantidade) + delta),
          descricao: item.descricao
        })
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error ?? 'Falha ao atualizar estoque');
      }
      await queryClient.invalidateQueries({ queryKey: ['materials'] });
    } catch (error: any) {
      setFormError(error.message ?? 'Falha ao atualizar material');
    }
  };

  const removeMaterial = async (id: string) => {
    try {
      setFormError(null);
      const response = await fetch(`/api/estoque/materiais/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error ?? 'Falha ao remover material');
      }
      await queryClient.invalidateQueries({ queryKey: ['materials'] });
    } catch (error: any) {
      setFormError(error.message ?? 'Falha ao remover material');
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <form className="space-y-4 rounded-2xl border border-white/10 bg-black/30 p-6" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <h3 className="text-lg font-semibold text-emerald-100">Cadastrar material</h3>
          <p className="text-xs text-emerald-200/60">Cadastre itens de consumo e monitore o giro do estoque.</p>
        </div>
        {formError ? <Alert tone="danger" title={formError} /> : null}
        <div className="space-y-2">
          <Label htmlFor="nome">Material</Label>
          <Input id="nome" placeholder="Resina composta" {...register('nome')} />
          {errors.nome ? <p className="text-xs text-red-400">{errors.nome.message}</p> : null}
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="marca">Marca</Label>
            <Input id="marca" placeholder="3M" {...register('marca')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="unidade">Unidade</Label>
            <Input id="unidade" placeholder="caixa" {...register('unidade')} />
            {errors.unidade ? <p className="text-xs text-red-400">{errors.unidade.message}</p> : null}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="quantidade">Quantidade</Label>
          <Input id="quantidade" type="number" min={0} step={1} {...register('quantidade', { valueAsNumber: true })} />
          {errors.quantidade ? <p className="text-xs text-red-400">{errors.quantidade.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="descricao">Observações</Label>
          <Input id="descricao" placeholder="Cor, validade, lote..." {...register('descricao')} />
        </div>
        <Button type="submit" className="w-full bg-cyan-500/80 text-black hover:bg-cyan-400" disabled={submitting}>
          {submitting ? 'Salvando...' : 'Registrar material'}
        </Button>
      </form>
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-emerald-100">Materiais em estoque</h3>
          <p className="text-xs text-emerald-200/60">Controle itens recorrentes, insumos e validade.</p>
        </div>
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-40 w-full rounded-2xl bg-white/10" />
            ))}
          </div>
        ) : isError ? (
          <Alert tone="danger" title="Falha ao carregar" description="Tente novamente em instantes." />
        ) : data && data.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {data.map((item) => (
              <div key={item.id} className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-base font-semibold text-white">{item.nome}</h4>
                    {item.marca ? <p className="text-xs text-emerald-200/70">Marca: {item.marca}</p> : null}
                  </div>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-emerald-100">{item.unidade}</span>
                </div>
                <p className="mt-3 text-sm font-medium text-emerald-100">
                  {item.quantidade} unidades disponíveis
                </p>
                {item.descricao ? <p className="text-xs text-emerald-200/60">{item.descricao}</p> : null}
                <div className="mt-4 flex items-center justify-between text-xs text-emerald-100/80">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="bg-cyan-500/10"
                      onClick={async () => {
                        await adjustQuantity(item, 1);
                      }}
                    >
                      +1
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="bg-cyan-500/10"
                      onClick={async () => {
                        await adjustQuantity(item, -1);
                      }}
                    >
                      -1
                    </Button>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-red-300 hover:text-red-200"
                    onClick={async () => {
                      await removeMaterial(item.id);
                    }}
                  >
                    Remover
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/20 bg-black/20 p-8 text-center text-sm text-emerald-100/70">
            Nenhum material cadastrado. Preencha o formulário para iniciar o controle.
          </div>
        )}
      </div>
    </div>
  );
}
