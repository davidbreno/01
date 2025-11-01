'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

const documentTypes = [
  { label: 'Receita', value: 'RECEITA' },
  { label: 'Prontuário', value: 'PRONTUARIO' },
  { label: 'Documento pessoal', value: 'DOCUMENTO_PESSOAL' },
  { label: 'Radiografia', value: 'RADIOGRAFIA' },
  { label: 'Outro', value: 'OUTRO' }
] as const;

type DocumentTypeValue = (typeof documentTypes)[number]['value'];

const documentTypeValues = documentTypes.map((type) => type.value) as [DocumentTypeValue, ...DocumentTypeValue[]];

const fileListSchema = z.custom<FileList | null | undefined>(
  (value) => {
    if (typeof FileList === 'undefined') {
      return true;
    }
    return value == null || value instanceof FileList;
  },
  { message: 'Selecione um arquivo válido' }
);

const formSchema = z.object({
  titulo: z.string().min(1, 'Informe um título'),
  tipo: z.enum(documentTypeValues),
  pacienteId: z.string().optional(),
  notas: z.string().optional(),
  arquivo: fileListSchema
});

type FormValues = z.infer<typeof formSchema>;

interface DocumentRecord {
  id: string;
  titulo: string;
  tipo: DocumentTypeValue;
  arquivoUrl: string;
  arquivoMime: string;
  notas?: string | null;
  paciente?: { nome: string } | null;
  createdAt: string;
}

interface Option {
  id: string;
  label: string;
}

async function fetchDocuments(params?: { pacienteId?: string; tipo?: DocumentTypeValue }) {
  const searchParams = new URLSearchParams();
  if (params?.pacienteId) searchParams.set('pacienteId', params.pacienteId);
  if (params?.tipo) searchParams.set('tipo', params.tipo);
  const response = await fetch(`/api/documentos?${searchParams.toString()}`);
  if (!response.ok) {
    throw new Error('Não foi possível carregar os documentos.');
  }
  return (await response.json()) as DocumentRecord[];
}

async function fetchPatients(): Promise<Option[]> {
  const response = await fetch('/api/pacientes?pageSize=100');
  if (!response.ok) {
    throw new Error('Falha ao carregar pacientes.');
  }
  const data = await response.json();
  return data.items.map((item: any) => ({ id: item.id, label: item.nome }));
}

async function uploadFile(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch('/api/upload', { method: 'POST', body: formData });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error ?? 'Falha ao enviar arquivo');
  }
  return (await response.json()) as { url: string; mime: string };
}

export function DocumentBoard() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<{ pacienteId?: string; tipo?: DocumentTypeValue }>({});
  const { data: documents, isLoading, isError } = useQuery({
    queryKey: ['documents', filters],
    queryFn: () => fetchDocuments(filters)
  });
  const {
    data: patients = [],
    isLoading: loadingPatients,
    isError: errorPatients
  } = useQuery({
    queryKey: ['patient-options'],
    queryFn: fetchPatients
  });
  const [message, setMessage] = useState<{ tone: 'success' | 'danger'; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      titulo: '',
      tipo: 'RECEITA',
      pacienteId: '',
      notas: ''
    }
  });

  const onSubmit = async (values: FormValues) => {
    if (!values.arquivo?.[0]) {
      setMessage({ tone: 'danger', text: 'Escolha um arquivo para anexar.' });
      return;
    }
    setMessage(null);
    setSubmitting(true);
    try {
      const upload = await uploadFile(values.arquivo[0]);
      const response = await fetch('/api/documentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: values.titulo,
          tipo: values.tipo,
          arquivoUrl: upload.url,
          arquivoMime: upload.mime,
          pacienteId: values.pacienteId || null,
          notas: values.notas || null
        })
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? 'Erro ao cadastrar documento');
      }
      reset({ titulo: '', tipo: values.tipo, arquivo: undefined, notas: '', pacienteId: '' });
      await queryClient.invalidateQueries({ queryKey: ['documents'] });
      setMessage({ tone: 'success', text: 'Documento registrado com sucesso.' });
      setTimeout(() => setMessage(null), 5000);
    } catch (error: any) {
      setMessage({ tone: 'danger', text: error.message ?? 'Erro ao registrar documento.' });
    } finally {
      setSubmitting(false);
    }
  };

  const removeDocument = async (id: string) => {
    try {
      setMessage(null);
      const response = await fetch(`/api/documentos/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? 'Falha ao remover documento');
      }
      await queryClient.invalidateQueries({ queryKey: ['documents'] });
      setMessage({ tone: 'success', text: 'Documento removido.' });
      setTimeout(() => setMessage(null), 4000);
    } catch (error: any) {
      setMessage({ tone: 'danger', text: error.message ?? 'Erro ao remover documento.' });
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <form className="space-y-4 rounded-3xl border border-white/10 bg-black/30 p-6" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <h3 className="text-lg font-semibold text-emerald-100">Anexar documento</h3>
          <p className="text-xs text-emerald-200/60">Envie receitas, prontuários, documentos pessoais ou radiografias.</p>
        </div>
        {message && message.tone === 'danger' ? <Alert tone="danger" title={message.text} /> : null}
        <div className="space-y-2">
          <Label htmlFor="titulo">Título</Label>
          <Input id="titulo" placeholder="Receita antibiótico" {...register('titulo')} />
          {errors.titulo ? <p className="text-xs text-red-400">{errors.titulo.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="tipo">Tipo</Label>
          <select id="tipo" className="w-full rounded-xl border border-white/20 bg-black/60 px-3 py-2 text-sm" {...register('tipo')}>
            {documentTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="pacienteId">Paciente</Label>
          <select
            id="pacienteId"
            className="w-full rounded-xl border border-white/20 bg-black/60 px-3 py-2 text-sm"
            disabled={loadingPatients}
            {...register('pacienteId')}
          >
            <option value="">Documento geral</option>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="arquivo">Arquivo</Label>
          <Input id="arquivo" type="file" accept="application/pdf,image/*" {...register('arquivo')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="notas">Notas</Label>
          <Input id="notas" placeholder="Observações adicionais" {...register('notas')} />
        </div>
        <Button type="submit" className="w-full bg-emerald-500/80 text-black hover:bg-emerald-400" disabled={submitting}>
          {submitting ? 'Enviando...' : 'Salvar documento'}
        </Button>
      </form>
      <div className="space-y-4">
        <div className="rounded-3xl border border-white/10 bg-black/30 p-6">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="filtroPaciente" className="text-xs uppercase tracking-[0.3em] text-emerald-200/60">
                Paciente
              </Label>
              <select
                id="filtroPaciente"
                className="w-full rounded-xl border border-white/20 bg-black/60 px-3 py-2 text-sm"
                disabled={loadingPatients}
                value={filters.pacienteId ?? ''}
                onChange={(event) => setFilters((prev) => ({ ...prev, pacienteId: event.target.value || undefined }))}
              >
                <option value="">Todos</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="filtroTipo" className="text-xs uppercase tracking-[0.3em] text-emerald-200/60">
                Tipo
              </Label>
              <select
                id="filtroTipo"
                className="w-full rounded-xl border border-white/20 bg-black/60 px-3 py-2 text-sm"
                value={filters.tipo ?? ''}
                onChange={(event) => setFilters((prev) => ({ ...prev, tipo: (event.target.value as DocumentTypeValue) || undefined }))}
              >
                <option value="">Todos</option>
                {documentTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <Button
                type="button"
                variant="ghost"
                className="w-full border border-white/20 bg-white/5 text-emerald-100"
                onClick={() => setFilters({})}
              >
                Limpar filtros
              </Button>
            </div>
          </div>
        </div>
        {message && message.tone === 'success' ? <Alert tone="success" title={message.text} /> : null}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-48 w-full rounded-2xl bg-white/10" />
            ))}
          </div>
        ) : isError || errorPatients ? (
          <Alert tone="danger" title="Falha ao carregar documentos" description="Atualize a página e tente novamente." />
        ) : documents && documents.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {documents.map((document) => (
              <div key={document.id} className="rounded-2xl border border-white/10 bg-black/30 p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-emerald-200/60">{document.tipo}</p>
                <h4 className="mt-2 text-sm font-semibold text-white">{document.titulo}</h4>
                {document.paciente ? (
                  <p className="text-xs text-emerald-200/70">Paciente: {document.paciente.nome}</p>
                ) : (
                  <p className="text-xs text-emerald-200/50">Documento geral</p>
                )}
                {document.notas ? <p className="mt-2 text-xs text-emerald-200/60">{document.notas}</p> : null}
                <div className="mt-4 flex items-center justify-between text-xs text-emerald-100/80">
                  <a
                    href={document.arquivoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full bg-emerald-500/20 px-4 py-2 font-medium text-emerald-100 hover:bg-emerald-500/30"
                  >
                    Abrir arquivo
                  </a>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-red-300 hover:text-red-200"
                    onClick={async () => {
                      await removeDocument(document.id);
                    }}
                  >
                    Remover
                  </Button>
                </div>
                <p className="mt-2 text-[10px] uppercase tracking-[0.35em] text-emerald-200/40">
                  {new Date(document.createdAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/20 bg-black/20 p-8 text-center text-sm text-emerald-100/70">
            Nenhum documento encontrado com os filtros atuais.
          </div>
        )}
      </div>
    </div>
  );
}
