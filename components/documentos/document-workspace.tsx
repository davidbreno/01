'use client';

import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  FilePlus,
  Filter,
  Loader2,
  Paperclip,
  Search,
  Users,
  Download,
  Sparkles
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, type AlertTone } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchPatientOptions, type Option } from '@/lib/client/options';

const TYPE_OPTIONS = [
  { value: 'PRONTUARIO', label: 'Prontuário' },
  { value: 'RECEITA', label: 'Receita' },
  { value: 'RADIOGRAFIA', label: 'Radiografia' },
  { value: 'DOCUMENTO_PESSOAL', label: 'Documento pessoal' }
] as const;

type DocumentType = (typeof TYPE_OPTIONS)[number]['value'];

type FormState = {
  pacienteId: string;
  titulo: string;
  tipo: DocumentType;
  observacoes: string;
  file: File | null;
};

const INITIAL_FORM: FormState = {
  pacienteId: '',
  titulo: '',
  tipo: 'PRONTUARIO',
  observacoes: '',
  file: null
};

interface DocumentItem {
  id: string;
  pacienteId: string;
  titulo: string;
  tipo: DocumentType;
  arquivoUrl: string;
  arquivoNome: string;
  mimeType: string;
  tamanho: number;
  observacoes?: string | null;
  createdAt: string;
  paciente?: { nome: string };
}

interface PaginatedDocuments {
  items: DocumentItem[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    pages: number;
  };
}

async function fetchDocuments({
  page,
  search,
  tipo,
  pacienteId
}: {
  page: number;
  search: string;
  tipo?: DocumentType;
  pacienteId?: string;
}) {
  const params = new URLSearchParams({ page: page.toString(), pageSize: '12' });
  const trimmed = search.trim();
  if (trimmed) {
    params.set('search', trimmed);
  }
  if (tipo) {
    params.set('tipo', tipo);
  }
  if (pacienteId) {
    params.set('pacienteId', pacienteId);
  }
  const response = await fetch(`/api/documentos?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Erro ao carregar documentos');
  }
  return (await response.json()) as PaginatedDocuments;
}

export function DocumentWorkspace() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<DocumentType | ''>('');
  const [patientFilter, setPatientFilter] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formState, setFormState] = useState<FormState>(INITIAL_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ tone: AlertTone; message: string } | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['documents', { page, search, typeFilter, patientFilter }],
    queryFn: () =>
      fetchDocuments({
        page,
        search,
        tipo: typeFilter || undefined,
        pacienteId: patientFilter || undefined
      })
  });

  const { data: patients = [] } = useQuery<Option[]>({
    queryKey: ['patient-options'],
    queryFn: () => fetchPatientOptions(200)
  });

  const summary = useMemo(() => {
    const base = TYPE_OPTIONS.reduce(
      (acc, option) => ({ ...acc, [option.value]: 0 }),
      {} as Record<DocumentType, number>
    );
    (data?.items ?? []).forEach((item) => {
      base[item.tipo] = (base[item.tipo] ?? 0) + 1;
    });
    return base;
  }, [data]);

  const totalPages = data?.meta.pages ?? 1;

  const resetForm = () => {
    setFormState(INITIAL_FORM);
    setFormError(null);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    resetForm();
  };

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    if (!formState.pacienteId) {
      setFormError('Selecione o paciente.');
      return;
    }
    if (!formState.titulo.trim()) {
      setFormError('Informe um título para o documento.');
      return;
    }
    if (!formState.file) {
      setFormError('Selecione o arquivo para anexar.');
      return;
    }
    setSubmitting(true);
    try {
      const uploadData = new FormData();
      uploadData.append('file', formState.file);
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: uploadData
      });
      if (!uploadResponse.ok) {
        const payload = await uploadResponse.json().catch(() => ({}));
        throw new Error(payload.error ?? 'Falha ao enviar arquivo.');
      }
      const uploaded = await uploadResponse.json();
      const response = await fetch('/api/documentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pacienteId: formState.pacienteId,
          titulo: formState.titulo.trim(),
          tipo: formState.tipo,
          arquivoUrl: uploaded.url,
          arquivoNome: formState.file.name,
          mimeType: uploaded.mime ?? formState.file.type,
          tamanho: formState.file.size,
          observacoes: formState.observacoes.trim() ? formState.observacoes.trim() : null
        })
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error ?? 'Erro ao cadastrar documento.');
      }
      await queryClient.invalidateQueries({ queryKey: ['documents'] });
      setPage(1);
      setFeedback({ tone: 'success', message: 'Documento anexado com sucesso.' });
      setTimeout(() => setFeedback(null), 4000);
      closeDialog();
    } catch (error: any) {
      setFormError(error.message ?? 'Não foi possível cadastrar o documento.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-white/10 bg-white/70 p-6 shadow-xl shadow-primary/10 backdrop-blur dark:bg-slate-950/70">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-primary/70">Central de documentos</p>
            <h1 className="text-3xl font-semibold text-foreground">Biblioteca clínica do Dr. David</h1>
            <p className="text-sm text-muted-foreground">
              Reúna receitas, prontuários, documentos pessoais e radiografias com busca inteligente e upload seguro.
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => (open ? setDialogOpen(true) : closeDialog())}>
            <DialogTrigger asChild>
              <Button className="gap-2 rounded-2xl bg-gradient-to-r from-primary via-primary/90 to-accent px-6 py-5 text-base font-semibold shadow-lg shadow-primary/30 hover:scale-[1.01]">
                <FilePlus className="h-4 w-4" /> Novo documento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl border-none bg-white/85 p-0 shadow-2xl backdrop-blur dark:bg-slate-900/90">
              <div className="space-y-4 p-8">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-semibold text-foreground">Cadastrar documento clínico</DialogTitle>
                </DialogHeader>
                {formError ? <Alert tone="danger" title={formError} /> : null}
                <form className="space-y-4" onSubmit={handleCreate}>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="paciente">Paciente</Label>
                      <select
                        id="paciente"
                        value={formState.pacienteId}
                        onChange={(event) => setFormState((prev) => ({ ...prev, pacienteId: event.target.value }))}
                        className="h-11 w-full rounded-xl border border-primary/20 bg-white/80 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 dark:bg-slate-900"
                        required
                      >
                        <option value="">Selecione o paciente</option>
                        {patients.map((patient) => (
                          <option key={patient.id} value={patient.id}>
                            {patient.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tipo">Tipo do documento</Label>
                      <select
                        id="tipo"
                        value={formState.tipo}
                        onChange={(event) =>
                          setFormState((prev) => ({ ...prev, tipo: event.target.value as DocumentType }))
                        }
                        className="h-11 w-full rounded-xl border border-primary/20 bg-white/80 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 dark:bg-slate-900"
                      >
                        {TYPE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="titulo">Título</Label>
                      <Input
                        id="titulo"
                        value={formState.titulo}
                        onChange={(event) => setFormState((prev) => ({ ...prev, titulo: event.target.value }))}
                        placeholder="Ex: Radiografia panorâmica"
                        className="h-11 rounded-xl border-primary/20 bg-white/80 focus-visible:ring-primary"
                        required
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="arquivo">Arquivo</Label>
                      <Input
                        id="arquivo"
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(event) =>
                          setFormState((prev) => ({ ...prev, file: event.target.files?.[0] ?? null }))
                        }
                        className="h-11 cursor-pointer rounded-xl border-primary/20 bg-white/80 file:mr-4 file:rounded-full file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-primary"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="observacoes">Observações</Label>
                      <Textarea
                        id="observacoes"
                        rows={4}
                        value={formState.observacoes}
                        onChange={(event) => setFormState((prev) => ({ ...prev, observacoes: event.target.value }))}
                        placeholder="Detalhes complementares, protocolos ou instruções"
                        className="rounded-2xl border-primary/20 bg-white/85 focus-visible:ring-primary"
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full rounded-2xl bg-gradient-to-r from-primary via-primary/90 to-accent font-semibold shadow-lg shadow-primary/30 hover:scale-[1.01]"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Anexando…
                      </>
                    ) : (
                      'Salvar documento'
                    )}
                  </Button>
                </form>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        {feedback ? <Alert tone={feedback.tone} title={feedback.message} className="mt-4" /> : null}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {TYPE_OPTIONS.map((option) => (
            <div
              key={option.value}
              className="rounded-3xl border border-white/20 bg-white/80 p-5 shadow-md shadow-primary/10 backdrop-blur dark:bg-slate-900/80"
            >
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">{option.label}</p>
              <p className="mt-4 text-3xl font-semibold text-foreground">{summary[option.value] ?? 0}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/70 p-6 shadow-inner shadow-primary/10 backdrop-blur dark:bg-slate-950/70">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por título ou nome do arquivo"
              className="h-11 rounded-xl border-primary/20 bg-white/80 pl-10 focus-visible:ring-primary"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="filtro-paciente" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              <Users className="h-4 w-4" /> Paciente
            </Label>
            <select
              id="filtro-paciente"
              value={patientFilter}
              onChange={(event) => {
                setPatientFilter(event.target.value);
                setPage(1);
              }}
              className="h-11 w-full rounded-xl border border-primary/20 bg-white/80 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 dark:bg-slate-900"
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
            <Label htmlFor="filtro-tipo" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              <Filter className="h-4 w-4" /> Tipo
            </Label>
            <select
              id="filtro-tipo"
              value={typeFilter}
              onChange={(event) => {
                setTypeFilter(event.target.value as DocumentType | '');
                setPage(1);
              }}
              className="h-11 w-full rounded-xl border border-primary/20 bg-white/80 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 dark:bg-slate-900"
            >
              <option value="">Todos</option>
              {TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[...Array(6)].map((_, index) => (
              <Skeleton key={index} className="h-48 rounded-3xl" />
            ))}
          </div>
        ) : isError ? (
          <Alert tone="danger" title="Não foi possível carregar os documentos." />
        ) : data && data.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-primary/30 bg-white/60 p-10 text-center shadow-inner dark:bg-slate-900/70">
            <Sparkles className="h-8 w-8 text-primary" />
            <p className="text-sm font-semibold text-foreground">Ainda não há documentos cadastrados.</p>
            <p className="text-xs text-muted-foreground">Comece adicionando receitas, radiografias e prontuários dos pacientes.</p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {data?.items.map((document) => (
                <article
                  key={document.id}
                  className="flex h-full flex-col justify-between rounded-3xl border border-white/20 bg-white/80 p-5 shadow-md shadow-primary/10 transition hover:-translate-y-1 hover:shadow-xl dark:bg-slate-900/70"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-muted-foreground">
                      <span>{TYPE_OPTIONS.find((option) => option.value === document.tipo)?.label}</span>
                      <span>{new Date(document.createdAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">{document.titulo}</h3>
                    <p className="text-xs text-muted-foreground">{document.paciente?.nome ?? 'Paciente não informado'}</p>
                    {document.observacoes ? (
                      <p className="text-sm text-muted-foreground">{document.observacoes}</p>
                    ) : null}
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-2 font-medium text-primary">
                      <Paperclip className="h-3.5 w-3.5" /> {document.arquivoNome}
                    </span>
                    <span>{(document.tamanho / 1024).toFixed(1)} KB</span>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <a
                      href={document.arquivoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-semibold text-primary transition hover:bg-primary/20"
                    >
                      <Download className="h-4 w-4" /> Abrir arquivo
                    </a>
                  </div>
                </article>
              ))}
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Página {page} de {totalPages} • {data?.meta.total ?? 0} documentos
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                >
                  Próxima
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
