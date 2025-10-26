'use client';

import { useRouter } from 'next/navigation';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert } from '@/components/ui/alert';

const schema = z.object({
  pacienteId: z.string().min(1),
  consultaId: z.string().optional(),
  anamnese: z.string().optional(),
  diagnostico: z.string().optional(),
  prescricao: z.string().optional(),
  observacoes: z.string().optional(),
  anexos: z.instanceof(FileList).optional()
});

type FormValues = z.infer<typeof schema>;

interface ConsultaResumo {
  id: string;
  inicio: string;
  status: string;
  medico: {
    name: string;
  };
}

export function ProntuarioForm({ pacienteId, consultas }: { pacienteId: string; consultas: ConsultaResumo[] }) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    reset
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      pacienteId
    }
  });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (values: FormValues) => {
    setMessage(null);
    setError(null);
    setLoading(true);
    try {
      const anexos: Array<{ url: string; mime: string }> = [];
      if (values.anexos && values.anexos.length) {
        for (const file of Array.from(values.anexos)) {
          const formData = new FormData();
          formData.append('file', file);
          const upload = await fetch('/api/upload', {
            method: 'POST',
            body: formData
          });
          if (!upload.ok) {
            const payload = await upload.json();
            throw new Error(payload.error ?? 'Falha ao subir arquivo');
          }
          const uploaded = await upload.json();
          anexos.push(uploaded);
        }
      }
      const response = await fetch('/api/prontuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pacienteId,
          consultaId: values.consultaId || null,
          conteudo: {
            anamnese: values.anamnese ?? null,
            diagnostico: values.diagnostico ?? null,
            prescricao: values.prescricao ?? null,
            observacoes: values.observacoes ?? null
          },
          anexos
        })
      });
      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error ?? 'Falha ao salvar prontuário');
      }
      setMessage('Prontuário registrado com sucesso.');
      reset({ pacienteId });
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} aria-busy={loading}>
      {message ? <Alert tone="success" title={message} /> : null}
      {error ? <Alert tone="danger" title={error} /> : null}
      <input type="hidden" value={pacienteId} {...register('pacienteId')} />
      <div className="space-y-2">
        <Label htmlFor="consultaId">Consulta relacionada</Label>
        <select
          id="consultaId"
          className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          {...register('consultaId')}
        >
          <option value="">Sem vínculo</option>
          {consultas.map((consulta) => (
            <option key={consulta.id} value={consulta.id}>
              {new Date(consulta.inicio).toLocaleString('pt-BR')} — {consulta.medico.name}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="anamnese">Anamnese</Label>
          <Textarea id="anamnese" rows={3} {...register('anamnese')} placeholder="Resumo da queixa e histórico" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="diagnostico">Diagnóstico</Label>
          <Textarea id="diagnostico" rows={3} {...register('diagnostico')} placeholder="Diagnóstico clínico" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="prescricao">Prescrição</Label>
          <Textarea id="prescricao" rows={3} {...register('prescricao')} placeholder="Medicações e orientações" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="observacoes">Observações</Label>
          <Textarea id="observacoes" rows={3} {...register('observacoes')} placeholder="Observações gerais" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="anexos">Anexos (PDF ou imagem)</Label>
        <input
          id="anexos"
          type="file"
          accept="application/pdf,image/*"
          multiple
          className="block w-full text-sm text-muted-foreground"
          {...register('anexos')}
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Salvando...
          </>
        ) : (
          'Salvar registro'
        )}
      </Button>
    </form>
  );
}
