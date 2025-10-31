'use client';

import { useState } from 'react';
import { Loader2, Paperclip, PlusCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';

export type PatientDocument = {
  id: string;
  titulo: string;
  tipo: 'RECEITA' | 'PRONTUARIO' | 'DOCUMENTO_PESSOAL' | 'RADIOGRAFIA';
  arquivoUrl: string;
  arquivoNome: string;
  mimeType: string;
  tamanho: number;
  observacoes?: string | null;
  createdAt: string;
};

const TYPE_LABELS: Record<PatientDocument['tipo'], string> = {
  RECEITA: 'Receita',
  PRONTUARIO: 'Prontuário',
  DOCUMENTO_PESSOAL: 'Documento pessoal',
  RADIOGRAFIA: 'Radiografia'
};

const TYPE_OPTIONS = [
  { value: 'PRONTUARIO', label: 'Prontuário' },
  { value: 'RECEITA', label: 'Receita' },
  { value: 'RADIOGRAFIA', label: 'Radiografia' },
  { value: 'DOCUMENTO_PESSOAL', label: 'Documento pessoal' }
] as const;

interface PatientDocumentsProps {
  pacienteId: string;
  initialDocuments: PatientDocument[];
}

export function PatientDocuments({ pacienteId, initialDocuments }: PatientDocumentsProps) {
  const [documents, setDocuments] = useState(initialDocuments);
  const [titulo, setTitulo] = useState('');
  const [tipo, setTipo] = useState<typeof TYPE_OPTIONS[number]['value']>('PRONTUARIO');
  const [observacoes, setObservacoes] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const resetForm = () => {
    setTitulo('');
    setTipo('PRONTUARIO');
    setObservacoes('');
    setFile(null);
    setError(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    if (!file) {
      setError('Selecione um arquivo para anexar.');
      return;
    }
    if (!titulo.trim()) {
      setError('Informe um título para o documento.');
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const uploadResponse = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!uploadResponse.ok) {
        const payload = await uploadResponse.json().catch(() => ({}));
        throw new Error(payload.error ?? 'Falha ao enviar arquivo');
      }
      const uploaded = await uploadResponse.json();
      const response = await fetch('/api/documentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pacienteId,
          titulo: titulo.trim(),
          tipo,
          arquivoUrl: uploaded.url,
          arquivoNome: file.name,
          mimeType: uploaded.mime ?? file.type,
          tamanho: file.size,
          observacoes: observacoes.trim() ? observacoes.trim() : null
        })
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error ?? 'Erro ao registrar documento');
      }
      const created = await response.json();
      setDocuments((prev) => [created, ...prev]);
      setSuccess('Documento anexado com sucesso.');
      resetForm();
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      setError(err.message ?? 'Não foi possível anexar o documento.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-3xl border border-primary/15 bg-white/70 p-6 shadow-inner shadow-primary/10 backdrop-blur dark:bg-slate-950/70"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-primary/70">Novo documento</p>
            <h3 className="text-lg font-semibold text-foreground">Adicionar arquivo clínico</h3>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <PlusCircle className="h-5 w-5" />
          </div>
        </div>
        {error ? <Alert tone="danger" title={error} /> : null}
        {success ? <Alert tone="success" title={success} /> : null}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="titulo">Título</Label>
            <Input
              id="titulo"
              value={titulo}
              onChange={(event) => setTitulo(event.target.value)}
              placeholder="Ex: Radiografia panorâmica"
              className="h-11 rounded-xl border-primary/20 bg-white/80 focus-visible:ring-primary"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo</Label>
            <select
              id="tipo"
              value={tipo}
              onChange={(event) => setTipo(event.target.value as typeof tipo)}
              className="h-11 w-full rounded-xl border border-primary/20 bg-white/80 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 dark:bg-slate-900"
            >
              {TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="arquivo">Arquivo</Label>
            <Input
              id="arquivo"
              type="file"
              accept="image/*,application/pdf"
              className="h-11 cursor-pointer rounded-xl border-primary/20 bg-white/80 file:mr-4 file:rounded-full file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-primary"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              rows={3}
              value={observacoes}
              onChange={(event) => setObservacoes(event.target.value)}
              className="rounded-xl border-primary/20 bg-white/80 focus-visible:ring-primary"
            />
          </div>
        </div>
        <Button
          type="submit"
          className="w-full rounded-2xl bg-gradient-to-r from-primary via-primary/90 to-accent font-semibold shadow-lg shadow-primary/30 hover:scale-[1.01]"
          disabled={uploading}
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Anexando…
            </>
          ) : (
            'Salvar documento'
          )}
        </Button>
      </form>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Documentos do paciente</h3>
        {documents.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum arquivo anexado até o momento.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {documents.map((document) => (
              <a
                key={document.id}
                href={document.arquivoUrl}
                target="_blank"
                rel="noreferrer"
                className="group relative flex h-full flex-col justify-between rounded-3xl border border-white/20 bg-white/80 p-5 shadow-md shadow-primary/10 transition hover:-translate-y-1 hover:shadow-xl dark:bg-slate-900/70"
              >
                <div>
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    {TYPE_LABELS[document.tipo]}
                  </span>
                  <h4 className="mt-4 text-base font-semibold text-foreground">{document.titulo}</h4>
                  <p className="mt-1 text-xs text-muted-foreground">{new Date(document.createdAt).toLocaleString('pt-BR')}</p>
                  {document.observacoes ? (
                    <p className="mt-3 text-sm text-muted-foreground">{document.observacoes}</p>
                  ) : null}
                </div>
                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-2 font-medium text-primary">
                    <Paperclip className="h-3.5 w-3.5" /> {document.arquivoNome}
                  </span>
                  <span>{(document.tamanho / 1024).toFixed(1)} KB</span>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
