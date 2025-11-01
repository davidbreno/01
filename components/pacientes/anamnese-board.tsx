'use client';

import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';

interface Question {
  id: string;
  pergunta: string;
  categoria?: string | null;
}

interface AnsweredQuestion extends Question {
  resposta: string;
}

interface Option {
  id: string;
  label: string;
}

async function fetchQuestions() {
  const response = await fetch('/api/anamnese/questions');
  if (!response.ok) {
    throw new Error('Falha ao carregar perguntas de anamnese.');
  }
  return (await response.json()) as Question[];
}

async function fetchPatients(): Promise<Option[]> {
  const response = await fetch('/api/pacientes?pageSize=100');
  if (!response.ok) {
    throw new Error('Falha ao carregar pacientes.');
  }
  const data = await response.json();
  return data.items.map((item: any) => ({ id: item.id, label: item.nome }));
}

async function fetchAnswers(patientId: string) {
  const response = await fetch(`/api/pacientes/${patientId}/anamnese`);
  if (!response.ok) {
    throw new Error('Não foi possível carregar a anamnese do paciente.');
  }
  return (await response.json()) as AnsweredQuestion[];
}

export function AnamneseBoard() {
  const queryClient = useQueryClient();
  const { data: questions, isLoading: loadingQuestions, isError: errorQuestions } = useQuery({
    queryKey: ['anamnese-questions'],
    queryFn: fetchQuestions
  });
  const { data: patients, isLoading: loadingPatients, isError: errorPatients } = useQuery({
    queryKey: ['patient-options'],
    queryFn: fetchPatients
  });

  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [statusMessage, setStatusMessage] = useState<{ tone: 'success' | 'danger'; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const { data: answered, isFetching: loadingAnswers } = useQuery({
    queryKey: ['anamnese', selectedPatientId],
    queryFn: () => fetchAnswers(selectedPatientId),
    enabled: Boolean(selectedPatientId)
  });

  useEffect(() => {
    if (answered) {
      setAnswers(
        answered.reduce<Record<string, string>>((acc, question) => {
          acc[question.id] = question.resposta;
          return acc;
        }, {})
      );
    }
  }, [answered]);

  const handleSubmit = async () => {
    if (!selectedPatientId) {
      setStatusMessage({ tone: 'danger', text: 'Selecione um paciente para salvar a anamnese.' });
      return;
    }
    if (!questions) return;
    setSaving(true);
    setStatusMessage(null);
    try {
      const payload = {
        pacienteId: selectedPatientId,
        respostas: questions
          .filter((question) => (answers[question.id] ?? '').trim().length > 0)
          .map((question) => ({ questionId: question.id, resposta: answers[question.id] }))
      };
      const response = await fetch(`/api/pacientes/${selectedPatientId}/anamnese`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? 'Erro ao salvar anamnese');
      }
      await queryClient.invalidateQueries({ queryKey: ['anamnese', selectedPatientId] });
      setStatusMessage({ tone: 'success', text: 'Anamnese atualizada com sucesso!' });
    } catch (error: any) {
      setStatusMessage({ tone: 'danger', text: error.message ?? 'Não foi possível salvar a anamnese.' });
    } finally {
      setSaving(false);
      setTimeout(() => setStatusMessage(null), 5000);
    }
  };

  if (loadingQuestions || loadingPatients) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full rounded-xl bg-white/10" />
        <Skeleton className="h-[460px] w-full rounded-3xl bg-white/10" />
      </div>
    );
  }

  if (errorQuestions || errorPatients || !questions || !patients) {
    return <Alert tone="danger" title="Erro ao carregar dados" description="Tente novamente em instantes." />;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-black/30 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
          <div className="flex-1 space-y-2">
            <label className="text-xs uppercase tracking-[0.3em] text-emerald-200/70" htmlFor="paciente">
              Selecione o paciente
            </label>
            <select
              id="paciente"
              className="w-full rounded-xl border border-white/20 bg-black/60 px-3 py-3 text-sm text-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              value={selectedPatientId}
              onChange={(event) => {
                setSelectedPatientId(event.target.value);
                setAnswers({});
              }}
            >
              <option value="">Escolha um paciente...</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.label}
                </option>
              ))}
            </select>
          </div>
          <Button
            type="button"
            disabled={!selectedPatientId || saving}
            className="bg-emerald-500/80 text-black hover:bg-emerald-400"
            onClick={handleSubmit}
          >
            {saving ? 'Salvando...' : 'Salvar anamnese'}
          </Button>
        </div>
        {statusMessage ? <Alert tone={statusMessage.tone} title={statusMessage.text} className="mt-4" /> : null}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {loadingAnswers ? (
          Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-40 w-full rounded-2xl bg-white/10" />
          ))
        ) : (
          questions.map((question) => (
            <div key={question.id} className="rounded-2xl border border-white/10 bg-black/30 p-5">
              <p className="text-xs uppercase tracking-[0.25em] text-emerald-200/60">{question.categoria ?? 'Pergunta'}</p>
              <h4 className="mt-2 text-sm font-semibold text-white">{question.pergunta}</h4>
              <Textarea
                className="mt-3 min-h-[120px] resize-none rounded-xl border border-white/10 bg-black/40 text-sm text-emerald-100"
                placeholder="Digite a resposta clínica..."
                value={answers[question.id] ?? ''}
                onChange={(event) => {
                  setAnswers((prev) => ({ ...prev, [question.id]: event.target.value }));
                }}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
