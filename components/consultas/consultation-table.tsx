'use client';

import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, MoreHorizontal, Bell, BellOff, BellRing } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';

type ConsultaStatus = 'AGENDADA' | 'CONFIRMADA' | 'CANCELADA' | 'CONCLUIDA';
const CONSULTA_STATUSES: ConsultaStatus[] = ['AGENDADA', 'CONFIRMADA', 'CANCELADA', 'CONCLUIDA'];
const STATUS_LABELS: Record<ConsultaStatus, string> = {
  AGENDADA: 'Agendada',
  CONFIRMADA: 'Confirmada',
  CANCELADA: 'Cancelada',
  CONCLUIDA: 'Concluída'
};

interface Consulta {
  id: string;
  paciente: { id: string; nome: string };
  medico: { id: string; name: string };
  inicio: string;
  fim: string;
  status: ConsultaStatus;
  notas?: string | null;
  lembreteAgendado?: string | null;
  lembreteEnviado?: boolean;
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

interface Option {
  id: string;
  label: string;
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

async function fetchPatientsOptions(): Promise<Option[]> {
  const response = await fetch('/api/pacientes?pageSize=100');
  if (!response.ok) return [];
  const data = await response.json();
  return data.items.map((paciente: any) => ({ id: paciente.id, label: paciente.nome }));
}

async function fetchDoctorsOptions(): Promise<Option[]> {
  const response = await fetch('/api/users/medicos');
  if (!response.ok) return [];
  const data = await response.json();
  return data.map((medico: any) => ({ id: medico.id, label: medico.name }));
}

interface ConsultationTableProps {
  variant?: 'default' | 'agenda';
}

export function ConsultationTable({ variant = 'default' }: ConsultationTableProps) {
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

  const { data: patients = [] } = useQuery({ queryKey: ['patient-options'], queryFn: fetchPatientsOptions });
  const { data: doctors = [] } = useQuery({ queryKey: ['doctor-options'], queryFn: fetchDoctorsOptions });

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
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <h1 className="text-2xl font-semibold">{variant === 'agenda' ? 'Agenda inteligente' : 'Consultas'}</h1>
          <p className="text-sm text-muted-foreground">
            {variant === 'agenda'
              ? 'Sincronize horários, lembretes e mantenha a equipe alinhada com o paciente.'
              : 'Acompanhe agenda, status e histórico de atendimentos.'}
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => (open ? setDialogOpen(true) : closeDialog())}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Nova consulta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? 'Editar consulta' : 'Agendar consulta'}</DialogTitle>
            </DialogHeader>
            {formError ? <Alert tone="danger" title={formError} /> : null}
            <ConsultationForm
              defaultValues={editing ?? undefined}
              patients={patients}
              doctors={doctors}
              submitting={submitting}
              onSubmit={async (values) => {
                await upsertConsulta(
                  {
                    ...values,
                    inicio: new Date(values.inicio).toISOString(),
                    fim: new Date(values.fim).toISOString(),
                    notas: values.notas || null,
                    lembreteAgendado: values.lembreteAgendado
                      ? new Date(values.lembreteAgendado).toISOString()
                      : null,
                    lembreteEnviado: values.lembreteEnviado ?? false
                  },
                  editing?.id
                );
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant={statusFilter ? 'outline' : 'default'}
          onClick={() => {
            setConsultaStatusFilter(undefined);
            setPage(1);
          }}
        >
          Todos
        </Button>
        {CONSULTA_STATUSES.map((status) => (
          <Button
            key={status}
            variant={statusFilter === status ? 'default' : 'outline'}
            onClick={() => {
              setConsultaStatusFilter(status);
              setPage(1);
            }}
          >
            {STATUS_LABELS[status]}
          </Button>
        ))}
      </div>
      {message ? <Alert tone="success" title={message} /> : null}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="lista">Lista</TabsTrigger>
          <TabsTrigger value="calendario">Calendário</TabsTrigger>
        </TabsList>
        <TabsContent value="lista" className="space-y-4">
          <div className="overflow-hidden rounded-2xl border bg-card">
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
                    <TableHead>Médico</TableHead>
                    <TableHead>Início</TableHead>
                    <TableHead>Fim</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Lembrete</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.items.map((consulta) => (
                    <TableRow key={consulta.id}>
                      <TableCell className="font-medium">{consulta.paciente.nome}</TableCell>
                      <TableCell>{consulta.medico.name}</TableCell>
                      <TableCell>{formatDate(consulta.inicio)}</TableCell>
                      <TableCell>{formatDate(consulta.fim)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {STATUS_LABELS[consulta.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 text-xs">
                          {consulta.lembreteAgendado ? (
                            <span className="flex items-center gap-1 text-muted-foreground">
                              {consulta.lembreteEnviado ? <BellRing className="h-3 w-3" /> : <Bell className="h-3 w-3" />}
                              {formatDate(consulta.lembreteAgendado)}
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <BellOff className="h-3 w-3" /> Sem lembrete
                            </span>
                          )}
                        </div>
                      </TableCell>
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
                              onClick={async () => {
                                await upsertConsulta(
                                  {
                                    pacienteId: consulta.paciente.id,
                                    medicoId: consulta.medico.id,
                                    inicio: consulta.inicio,
                                    fim: consulta.fim,
                                    status: consulta.status,
                                    notas: consulta.notas ?? null,
                                    lembreteAgendado: consulta.lembreteAgendado,
                                    lembreteEnviado: !consulta.lembreteEnviado
                                  },
                                  consulta.id
                                );
                              }}
                            >
                              {consulta.lembreteEnviado ? 'Marcar lembrete pendente' : 'Confirmar envio do lembrete'}
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
        <TabsContent value="calendario" className="rounded-2xl border bg-card p-6">
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
              <div key={date} className="rounded-xl border p-4">
                <p className="text-sm font-semibold">{formatDate(date)}</p>
                <ul className="mt-2 space-y-1 text-sm">
                  {consultas.map((consulta) => (
                    <li key={consulta.id} className="flex items-center justify-between">
                      <span>
                        {new Date(consulta.inicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} — {consulta.paciente.nome}
                      </span>
                      <span className="text-xs uppercase text-muted-foreground">{STATUS_LABELS[consulta.status]}</span>
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
    </div>
  );
}
