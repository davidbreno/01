'use client';

import { useEffect, useMemo, useState } from 'react';
import { Loader2, ClipboardList, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert } from '@/components/ui/alert';

export interface PatientAnamnesisAnswer {
  id: string;
  perguntaId: string;
  resposta: string;
  pergunta: {
    id: string;
    pergunta: string;
    categoria?: string | null;
  };
}

interface Question {
  id: string;
  pergunta: string;
  categoria?: string | null;
}

interface PatientAnamnesisProps {
  pacienteId: string;
  initialAnswers: PatientAnamnesisAnswer[];
}

type LocalAnswer = {
  perguntaId: string;
  selecionada: boolean;
  resposta: string;
};

export function PatientAnamnesis({ pacienteId, initialAnswers }: PatientAnamnesisProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, LocalAnswer>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        setLoading(true);
        const response = await fetch('/api/anamnese/perguntas', { signal: controller.signal });
        if (!response.ok) {
          throw new Error('Não foi possível carregar as perguntas de anamnese.');
        }
        const data: Question[] = await response.json();
        setQuestions(data);
        const initial: Record<string, LocalAnswer> = {};
        data.forEach((question) => {
          const answer = initialAnswers.find((item) => item.perguntaId === question.id);
          initial[question.id] = {
            perguntaId: question.id,
            selecionada: Boolean(answer),
            resposta: answer?.resposta ?? ''
          };
        });
        setAnswers(initial);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          setError(err.message ?? 'Falha ao carregar perguntas.');
        }
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, [initialAnswers]);

  const groupedQuestions = useMemo(() => {
    return questions.reduce<Record<string, Question[]>>((acc, question) => {
      const key = question.categoria ?? 'Geral';
      acc[key] = acc[key] ?? [];
      acc[key].push(question);
      return acc;
    }, {});
  }, [questions]);

  const toggleQuestion = (questionId: string) => {
    setAnswers((prev) => {
      const current = prev[questionId];
      return {
        ...prev,
        [questionId]: {
          perguntaId: questionId,
          selecionada: !current?.selecionada,
          resposta: current?.resposta ?? ''
        }
      };
    });
  };

  const updateAnswer = (questionId: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        perguntaId: questionId,
        selecionada: prev[questionId]?.selecionada ?? Boolean(value.trim()),
        resposta: value
      }
    }));
  };

  const handleSave = async () => {
    setError(null);
    setSuccess(null);
    const selected = Object.values(answers)
      .filter((item) => item.selecionada && item.resposta.trim())
      .map((item) => ({ perguntaId: item.perguntaId, resposta: item.resposta.trim() }));
    if (!selected.length) {
      setError('Selecione pelo menos uma pergunta e preencha a resposta.');
      return;
    }
    setSaving(true);
    try {
      const response = await fetch('/api/anamnese/respostas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pacienteId, respostas: selected })
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error ?? 'Não foi possível salvar as respostas.');
      }
      setSuccess('Anamnese atualizada com sucesso.');
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      setError(err.message ?? 'Falha ao salvar anamnese.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 rounded-3xl border border-primary/15 bg-white/70 p-6 shadow-inner shadow-primary/10 backdrop-blur dark:bg-slate-950/70">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <ClipboardList className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-primary/70">Anamnese guiada</p>
          <h2 className="text-lg font-semibold text-foreground">Perguntas essenciais do protocolo Dr. David</h2>
          <p className="text-sm text-muted-foreground">
            Personalize as respostas do paciente selecionando apenas os tópicos relevantes para o atendimento.
          </p>
        </div>
      </div>
      {error ? <Alert tone="danger" title={error} /> : null}
      {success ? <Alert tone="success" title={success} /> : null}
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Carregando perguntas…
        </div>
      ) : (
        <div className="space-y-5">
          {Object.entries(groupedQuestions).map(([categoria, itens]) => (
            <div key={categoria} className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{categoria}</h3>
              <div className="grid gap-4 lg:grid-cols-2">
                {itens.map((question) => {
                  const answer = answers[question.id];
                  const active = answer?.selecionada ?? false;
                  return (
                    <div
                      key={question.id}
                      className="space-y-2 rounded-2xl border border-white/30 bg-white/80 p-4 shadow-sm transition hover:shadow-lg dark:bg-slate-900/70"
                    >
                      <label className="flex items-center justify-between gap-3 text-sm font-medium text-foreground">
                        <span>{question.pergunta}</span>
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-primary/30 text-primary focus:ring-primary"
                          checked={active}
                          onChange={() => toggleQuestion(question.id)}
                        />
                      </label>
                      <Textarea
                        rows={3}
                        placeholder="Digite a resposta clínica"
                        value={answer?.resposta ?? ''}
                        onChange={(event) => updateAnswer(question.id, event.target.value)}
                        className="rounded-xl border-primary/20 bg-white/90 text-sm focus-visible:ring-primary"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
      <Button
        type="button"
        onClick={handleSave}
        disabled={saving || loading}
        className="w-full rounded-2xl bg-gradient-to-r from-primary via-primary/90 to-accent font-semibold shadow-lg shadow-primary/30 hover:scale-[1.01]"
      >
        {saving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando…
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" /> Salvar respostas selecionadas
          </>
        )}
      </Button>
    </div>
  );
}
