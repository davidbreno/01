'use client';

import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, MoreHorizontal } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ConsultationForm } from './consultation-form';
import { Alert } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { DayPicker } from 'react-day-picker';
import { formatDate } from '@/lib/utils';
import { fetchDoctorOptions, fetchPatientOptions, type Option } from '@/lib/client/options';

type ConsultaStatus = 'AGENDADA' | 'CONFIRMADA' | 'CANCELADA' | 'CONCLUIDA';
const CONSULTA_STATUSES: ConsultaStatus[] = ['AGENDADA', 'CONFIRMADA', 'CANCELADA', 'CONCLUIDA'];
const STATUS_LABELS: Record<ConsultaStatus, string> = {
  AGENDADA: 'Agendada',
  CONFIRMADA: 'Confirmada',
  CANCELADA: 'Cancelada',
  CONCLUIDA: 'Concluída'
};

const STATUS_ACCENTS: Record<ConsultaStatus, string> = {
  AGENDADA: 'from-primary/70 via-primary/80 to-primary/90',
  CONFIRMADA: 'from-emerald-400 via-emerald-500 to-emerald-600',
  CANCELADA: 'from-destructive/80 via-destructive to-destructive/90',
  CONCLUIDA: 'from-accent/70 via-accent/80 to-accent/90'
};

interface Consulta {
  id: string;
  paciente: { id: string; nome: string };
  medico: { id: string; name: string };
  inicio: string;
  fim: string;
  status: ConsultaStatus;
  notas?: string | null;
  lembreteAtivo: boolean;
  lembreteAntecedenciaMinutos?: number | null;
}

interface PaginatedConsultas {
  items: Consulta[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    pages: number;
  };
}

async function fetchConsultas(page: number, status?: ConsultaStatus) {
  const params = new URLSearchParams({ page: page.toString() });
  if (status) params.set('status', status);
  const response = await fetch(`/api/consultas?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Erro ao carregar consultas');
  }
  return (await response.json()) as PaginatedConsultas;
}

export function ConsultationTable() {
  const [page, setPage] = useState(1);
  const [statusFilter, setConsultaStatusFilter] = useState<ConsultaStatus | undefined>(undefined);
  const [tab, setTab] = useState('lista');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Consulta | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['consultas', { page, statusFilter }],
    queryFn: () => fetchConsultas(page, statusFilter)
  });

  const { data: patients = [] } = useQuery({ queryKey: ['patient-options'], queryFn: () => fetchPatientOptions() });
  const { data: doctors = [] } = useQuery({ queryKey: ['doctor-options'], queryFn: () => fetchDoctorOptions() });

  const totalPages = data?.meta.pages ?? 1;

  const eventsByDate = useMemo(() => {
    if (!data?.items) return {} as Record<string, Consulta[]>;
    return data.items.reduce<Record<string, Consulta[]>>((acc, consulta) => {
      const key = consulta.inicio.slice(0, 10);
      acc[key] = acc[key] ?? [];
      acc[key].push(consulta);
      return acc;
    }, {});
  }, [data]);

  const summary = useMemo(() => {
    return (data?.items ?? []).reduce(
      (acc, consulta) => {
        acc[consulta.status] = (acc[consulta.status] ?? 0) + 1;
        return acc;
      },
      { AGENDADA: 0, CONFIRMADA: 0, CANCELADA: 0, CONCLUIDA: 0 } as Record<ConsultaStatus, number>
    );
  }, [data]);

  const upcoming = useMemo(() => {
    const now = Date.now();
    return [...(data?.items ?? [])]
      .filter((consulta) => new Date(consulta.inicio).getTime() >= now)
      .sort((a, b) => new Date(a.inicio).getTime() - new Date(b.inicio).getTime())
      .slice(0, 5);
  }, [data]);

  const closeDialog = () => {
    setDialogOpen(false);
    setEditing(null);
    setFormError(null);
    setSubmitting(false);
  };

  const upsertConsulta = async (values: any, id?: string) => {
    setFormError(null);
    setSubmitting(true);
    try {
      const endpoint = id ? `/api/consultas/${id}` : '/api/consultas';
      const method = id ? 'PUT' : 'POST';
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });
      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error ?? 'Erro ao salvar consulta');
      }
      await queryClient.invalidateQueries({ queryKey: ['consultas'] });
      setMessage(id ? 'Consulta atualizada.' : 'Consulta criada.');
      setTimeout(() => setMessage(null), 4000);
      closeDialog();
    } catch (error: any) {
      setFormError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const deleteConsulta = async (consulta: Consulta) => {
    const response = await fetch(`/api/consultas/${consulta.id}`, { method: 'DELETE' });
    if (!response.ok) {
      const payload = await response.json();
      throw new Error(payload.error ?? 'Erro ao remover consulta');
    }
    await queryClient.invalidateQueries({ queryKey: ['consultas'] });
    setMessage('Consulta removida.');
    setTimeout(() => setMessage(null), 4000);
  };

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-white/10 bg-white/60 p-6 shadow-xl shadow-primary/10 backdrop-blur dark:bg-slate-950/60">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-primary/70">Agenda clínica</p>
            <h1 className="text-3xl font-semibold text-foreground">Consultas e bloqueios</h1>
            <p className="text-sm text-muted-foreground">Sincronize horários, confirme presença e ative lembretes inteligentes.</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => (open ? setDialogOpen(true) : closeDialog())}>
            <DialogTrigger asChild>
              <Button className="gap-2 rounded-2xl bg-gradient-to-r from-primary via-primary/90 to-accent px-6 py-5 text-base font-semibold shadow-lg shadow-primary/30 hover:scale-[1.01]">
                <Plus className="h-4 w-4" /> Nova consulta
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl border-none bg-white/80 p-0 shadow-2xl backdrop-blur dark:bg-slate-900/90">
              <div className="space-y-4 p-8">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-semibold text-foreground">
                    {editing ? 'Editar consulta' : 'Agendar consulta'}
                  </DialogTitle>
                </DialogHeader>
                {formError ? <Alert tone="danger" title={formError} /> : null}
                <ConsultationForm
                  defaultValues={editing ?? undefined}
                  patients={patients}
                  doctors={doctors}
                  submitting={submitting}
                  onSubmit={async (values) => {
                    const lembreteAtivo = Boolean(values.lembreteAtivo);
                    const antecedencia = lembreteAtivo
                      ? Number(values.lembreteAntecedenciaMinutos ?? '30')
                      : null;
                    await upsertConsulta(
                      {
                        ...values,
                        inicio: new Date(values.inicio).toISOString(),
                        fim: new Date(values.fim).toISOString(),
                        notas: values.notas || null,
                        lembreteAtivo,
                        lembreteAntecedenciaMinutos: antecedencia
                      },
                      editing?.id
                    );
                  }}
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>
        {message ? <Alert tone="success" title={message} className="mt-4" /> : null}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {CONSULTA_STATUSES.map((status) => (
            <div
              key={status}
              className="rounded-3xl border border-white/20 bg-white/70 p-5 shadow-md shadow-primary/10 backdrop-blur dark:bg-slate-900/80"
            >
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">{STATUS_LABELS[status]}</p>
              <p className="mt-4 text-3xl font-semibold text-foreground">{summary[status] ?? 0}</p>
              <div className={cn('mt-4 h-2 w-full rounded-full bg-gradient-to-r', STATUS_ACCENTS[status])} />
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button
            variant={statusFilter ? 'outline' : 'default'}
            className={cn(
              'rounded-2xl border-primary/20 bg-primary/10 text-primary hover:bg-primary/20',
              !statusFilter && 'bg-gradient-to-r from-primary via-primary/90 to-accent text-white shadow-lg shadow-primary/30'
            )}
            onClick={() => {
              setConsultaStatusFilter(undefined);
              setPage(1);
            }}
          >
            Todas
          </Button>
          {CONSULTA_STATUSES.map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? 'default' : 'outline'}
              className={cn(
                'rounded-2xl border-primary/20 bg-white/80 text-sm font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary',
                statusFilter === status && 'bg-gradient-to-r from-primary via-primary/80 to-accent text-white shadow'
              )}
              onClick={() => {
                setConsultaStatusFilter(status);
                setPage(1);
              }}
            >
              {STATUS_LABELS[status]}
            </Button>
          ))}
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Tabs value={tab} onValueChange={setTab} className="rounded-3xl border border-white/10 bg-white/70 p-6 shadow-xl backdrop-blur dark:bg-slate-950/60">
        <TabsList className="rounded-full bg-primary/10 p-1">
          <TabsTrigger value="lista" className="rounded-full px-6 py-2 text-sm font-semibold">
            Lista dinâmica
          </TabsTrigger>
          <TabsTrigger value="calendario" className="rounded-full px-6 py-2 text-sm font-semibold">
            Calendário
          </TabsTrigger>
        </TabsList>
        <TabsContent value="lista" className="space-y-4">
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/80 shadow-inner shadow-primary/5 dark:bg-slate-900/70">
            {isLoading ? (
              <div className="space-y-4 p-6">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : isError ? (
              <div className="p-6 text-sm text-destructive">Não foi possível carregar as consultas.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Profissional</TableHead>
                    <TableHead>Início</TableHead>
                    <TableHead>Fim</TableHead>
                    <TableHead>Lembrete</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.items.map((consulta) => (
                    <TableRow key={consulta.id} className="transition hover:bg-primary/5">
                      <TableCell className="font-medium">{consulta.paciente.nome}</TableCell>
                      <TableCell>{consulta.medico.name}</TableCell>
                      <TableCell>{new Date(consulta.inicio).toLocaleString('pt-BR')}</TableCell>
                      <TableCell>{new Date(consulta.fim).toLocaleString('pt-BR')}</TableCell>
                      <TableCell>
                        {consulta.lembreteAtivo ? (
                          <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                            {consulta.lembreteAntecedenciaMinutos ?? 30} min antes
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>{STATUS_LABELS[consulta.status]}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setEditing(consulta);
                                setDialogOpen(true);
                              }}
                            >
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={async () => {
                                try {
                                  await deleteConsulta(consulta);
                                } catch (error: any) {
                                  setMessage(error.message);
                                  setTimeout(() => setMessage(null), 4000);
                                }
                              }}
                            >
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Página {page} de {totalPages}
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
        </TabsContent>
        <TabsContent value="calendario" className="rounded-3xl border border-white/10 bg-white/80 p-6 shadow-inner shadow-primary/5 dark:bg-slate-900/70">
          <DayPicker
            mode="single"
            modifiers={
              Object.keys(eventsByDate).reduce<Record<string, Date[]>>((acc, date) => {
                acc['hasEvent'] = acc['hasEvent'] ?? [];
                acc['hasEvent'].push(new Date(date));
                return acc;
              }, {})
            }
            modifiersStyles={{
              hasEvent: {
                backgroundColor: 'hsl(var(--primary))',
                color: 'white'
              }
            }}
          />
          <div className="mt-6 space-y-3">
            {Object.entries(eventsByDate).map(([date, consultas]) => (
              <div key={date} className="rounded-2xl border border-white/20 bg-white/70 p-4 shadow-sm dark:bg-slate-900/60">
                <p className="text-sm font-semibold text-foreground">{formatDate(date)}</p>
                <ul className="mt-2 space-y-2 text-sm">
                  {consultas.map((consulta) => (
                    <li key={consulta.id} className="flex items-center justify-between">
                      <span className="font-medium text-foreground">
                        {new Date(consulta.inicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} — {consulta.paciente.nome}
                      </span>
                      <span className="text-xs uppercase tracking-wide text-muted-foreground">{STATUS_LABELS[consulta.status]}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {Object.keys(eventsByDate).length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma consulta neste período.</p>
            ) : null}
          </div>
        </TabsContent>
      </Tabs>
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-primary/20 via-primary/10 to-accent/10 p-6 shadow-xl shadow-primary/20 backdrop-blur dark:from-slate-900/80 dark:via-slate-900/70 dark:to-slate-900/60">
        <h2 className="text-lg font-semibold text-foreground">Próximas consultas</h2>
        <p className="text-xs text-muted-foreground">Os cinco próximos encontros confirmados com tempo de lembrete configurado.</p>
        <div className="mt-4 space-y-3">
          {upcoming.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma consulta futura cadastrada.</p>
          ) : (
            upcoming.map((consulta) => (
              <div key={consulta.id} className="rounded-2xl border border-white/30 bg-white/70 p-4 shadow-sm dark:bg-slate-900/70">
                <div className="flex items-center justify-between text-xs uppercase tracking-wide text-muted-foreground">
                  <span>{formatDate(consulta.inicio)}</span>
                  <span>{STATUS_LABELS[consulta.status]}</span>
                </div>
                <p className="mt-2 text-sm font-semibold text-foreground">{consulta.paciente.nome}</p>
                <p className="text-xs text-muted-foreground">{consulta.medico.name}</p>
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {new Date(consulta.inicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {consulta.lembreteAtivo ? (
                    <span className="inline-flex items-center rounded-full bg-primary/15 px-2 py-1 font-medium text-primary">
                      Lembrete {consulta.lembreteAntecedenciaMinutos ?? 30} min
                    </span>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
    </div>
  );
}
