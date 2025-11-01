'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { implantSchema, type ImplantFormValues } from '@/lib/validations/estoque';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ImageOff } from 'lucide-react';

const implantCategories = [
  { label: 'CMI — Cone Morse Interno', value: 'CMI' },
  { label: 'HE — Hexágono Externo', value: 'HE' },
  { label: 'HI TAPA — Hexágono Interno', value: 'HI_TAPA' }
] as const;

type FormValues = ImplantFormValues & { imagemArquivo?: FileList };

type ImplantRecord = ImplantFormValues & { id: string };

const fileListSchema = z.custom<FileList | null | undefined>(
  (value) => {
    if (typeof FileList === 'undefined') {
      return true;
    }
    return value == null || value instanceof FileList;
  },
  { message: 'Selecione uma imagem válida' }
);

const formSchema: z.ZodType<FormValues> = implantSchema.extend({ imagemArquivo: fileListSchema });

async function fetchImplants(): Promise<ImplantRecord[]> {
  const response = await fetch('/api/estoque/implantes');
  if (!response.ok) {
    throw new Error('Não foi possível carregar os implantes.');
  }
  return (await response.json()) as ImplantRecord[];
}

async function uploadImage(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error ?? 'Erro ao enviar imagem');
  }
  return (await response.json()) as { url: string };
}

export function ImplantPanel() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({ queryKey: ['implants'], queryFn: fetchImplants });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: '',
      categoria: implantCategories[0].value,
      modelo: '',
      tamanho: '',
      marca: '',
      quantidade: 0,
      descricao: '',
      imagemUrl: null,
      imagemArquivo: undefined
    }
  });

  const onSubmit = async (values: FormValues) => {
    setFormError(null);
    setSubmitting(true);
    try {
      let imagemUrl = values.imagemUrl ?? null;
      const file = values.imagemArquivo?.[0];
      if (file) {
        const upload = await uploadImage(file);
        imagemUrl = upload.url;
      }
      const response = await fetch('/api/estoque/implantes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: values.nome,
          categoria: values.categoria,
          modelo: values.modelo,
          tamanho: values.tamanho || null,
          marca: values.marca,
          quantidade: Number(values.quantidade),
          descricao: values.descricao || null,
          imagemUrl
        })
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error ?? 'Erro ao registrar implante');
      }
      reset({
        nome: '',
        categoria: values.categoria,
        modelo: '',
        tamanho: '',
        marca: '',
        quantidade: 0,
        descricao: '',
        imagemArquivo: undefined,
        imagemUrl: null
      });
      await queryClient.invalidateQueries({ queryKey: ['implants'] });
    } catch (error: any) {
      setFormError(error.message ?? 'Erro inesperado');
    } finally {
      setSubmitting(false);
    }
  };

  const adjustQuantity = async (item: ImplantRecord, delta: number) => {
    try {
      setFormError(null);
      const response = await fetch(`/api/estoque/implantes/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: item.nome,
          categoria: item.categoria,
          modelo: item.modelo,
          tamanho: item.tamanho,
          marca: item.marca,
          quantidade: Math.max(0, Number(item.quantidade) + delta),
          descricao: item.descricao,
          imagemUrl: item.imagemUrl ?? null
        })
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error ?? 'Erro ao atualizar quantidade');
      }
      await queryClient.invalidateQueries({ queryKey: ['implants'] });
    } catch (error: any) {
      setFormError(error.message ?? 'Falha ao atualizar quantidade');
    }
  };

  const removeImplant = async (id: string) => {
    try {
      setFormError(null);
      const response = await fetch(`/api/estoque/implantes/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error ?? 'Falha ao remover implante');
      }
      await queryClient.invalidateQueries({ queryKey: ['implants'] });
    } catch (error: any) {
      setFormError(error.message ?? 'Falha ao remover implante');
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <form className="space-y-4 rounded-2xl border border-white/10 bg-black/30 p-6" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <h3 className="text-lg font-semibold text-emerald-100">Cadastrar implante</h3>
          <p className="text-xs text-emerald-200/60">Preencha os dados para manter o estoque sempre atualizado.</p>
        </div>
        {formError ? <Alert tone="danger" title={formError} /> : null}
        <div className="space-y-2">
          <Label htmlFor="nome">Nome comercial</Label>
          <Input id="nome" placeholder="Implante Prime" {...register('nome')} />
          {errors.nome ? <p className="text-xs text-red-400">{errors.nome.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="categoria">Categoria</Label>
          <select id="categoria" className="w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-sm" {...register('categoria')}>
            {implantCategories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="modelo">Modelo</Label>
            <Input id="modelo" {...register('modelo')} />
            {errors.modelo ? <p className="text-xs text-red-400">{errors.modelo.message}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="tamanho">Tamanho</Label>
            <Input id="tamanho" placeholder="3.5 x 11 mm" {...register('tamanho')} />
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="marca">Marca</Label>
            <Input id="marca" {...register('marca')} />
            {errors.marca ? <p className="text-xs text-red-400">{errors.marca.message}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="quantidade">Quantidade</Label>
            <Input id="quantidade" type="number" min={0} step={1} {...register('quantidade', { valueAsNumber: true })} />
            {errors.quantidade ? <p className="text-xs text-red-400">{errors.quantidade.message}</p> : null}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="descricao">Descrição</Label>
          <Input id="descricao" placeholder="Observações e torque recomendado" {...register('descricao')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="imagemArquivo">Foto do implante</Label>
          <Input id="imagemArquivo" type="file" accept="image/*" {...register('imagemArquivo')} />
        </div>
        <Button type="submit" className="w-full bg-emerald-500/80 text-black hover:bg-emerald-400" disabled={submitting}>
          {submitting ? 'Salvando...' : 'Registrar implante'}
        </Button>
      </form>
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-emerald-100">Implantes cadastrados</h3>
          <p className="text-xs text-emerald-200/60">Atualize estoque, visualize fotos e categorias.</p>
        </div>
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-48 w-full rounded-2xl bg-white/10" />
            ))}
          </div>
        ) : isError ? (
          <Alert tone="danger" title="Falha ao carregar" description="Tente novamente mais tarde." />
        ) : data && data.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {data.map((item) => (
              <div key={item.id} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/30 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-base font-semibold text-white">{item.nome}</h4>
                    <p className="text-xs uppercase tracking-wide text-emerald-200/60">{item.modelo}</p>
                  </div>
                  <Badge variant="outline" className="border-emerald-400/60 text-emerald-100">
                    {item.categoria}
                  </Badge>
                </div>
                <p className="mt-2 text-xs text-emerald-100/70">{item.marca}</p>
                <p className="text-xs text-emerald-200/60">{item.tamanho ?? 'Tamanho não informado'}</p>
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
                      className="bg-emerald-500/10"
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
                      className="bg-emerald-500/10"
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
                      await removeImplant(item.id);
                    }}
                  >
                    Remover
                  </Button>
                </div>
                {item.imagemUrl ? (
                  <img
                    src={item.imagemUrl}
                    alt={item.nome}
                    className="mt-4 h-28 w-full rounded-xl object-cover transition-transform group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="mt-4 flex h-28 items-center justify-center rounded-xl border border-dashed border-white/10 text-emerald-200/40">
                    <ImageOff className="h-6 w-6" />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/20 bg-black/20 p-8 text-center text-sm text-emerald-100/70">
            Nenhum implante cadastrado ainda. Utilize o formulário ao lado para registrar o primeiro.
          </div>
        )}
      </div>
    </div>
  );
}
