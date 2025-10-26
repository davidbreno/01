'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, MoreHorizontal, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Alert, type AlertTone } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { PatientForm } from './patient-form';

interface Paciente {
  id: string;
  nome: string;
  cpf: string;
  nascimento: string;
  sexo: string;
  telefone?: string | null;
  email?: string | null;
  endereco?: string | null;
  convenio?: string | null;
  carteirinha?: string | null;
  alergias?: string | null;
  observacoes?: string | null;
  arquivado: boolean;
  createdAt: string;
}

interface PaginatedPatients {
  items: Paciente[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    pages: number;
  };
}

async function fetchPatients(page: number, search: string) {
  const params = new URLSearchParams({ page: page.toString() });
  if (search.trim()) {
    params.set('search', search.trim());
  }
  const response = await fetch(`/api/pacientes?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Erro ao carregar pacientes');
  }
  return (await response.json()) as PaginatedPatients;
}

export function PatientTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Paciente | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<AlertTone>('info');
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['patients', { page, search }],
    queryFn: () => fetchPatients(page, search)
  });

  const totalPages = data?.meta.pages ?? 1;

  const closeDialog = () => {
    setDialogOpen(false);
    setEditing(null);
    setFormError(null);
    setFormSubmitting(false);
  };

  const submitForm = async (values: any) => {
    setFormError(null);
    setFormSubmitting(true);
    try {
      const payload = {
        ...values,
        nascimento: values.nascimento,
        telefone: values.telefone || null,
        email: values.email || null,
        endereco: values.endereco || null,
        convenio: values.convenio || null,
        carteirinha: values.carteirinha || null,
        alergias: values.alergias || null,
        observacoes: values.observacoes || null
      };
      const endpoint = editing ? `/api/pacientes/${editing.id}` : '/api/pacientes';
      const method = editing ? 'PUT' : 'POST';
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? 'Erro ao salvar paciente');
      }
      await queryClient.invalidateQueries({ queryKey: ['patients'] });
      await queryClient.invalidateQueries({ queryKey: ['patient-options'] });
      setMessage(editing ? 'Paciente atualizado com sucesso.' : 'Paciente cadastrado com sucesso.');
      setMessageTone('success');
      setTimeout(() => setMessage(null), 4000);
      closeDialog();
    } catch (error: any) {
      setFormError(error.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleArchive = async (paciente: Paciente) => {
    try {
      const response = await fetch(`/api/pacientes/${paciente.id}`, { method: 'DELETE' });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? 'Não foi possível arquivar.');
      }
      await queryClient.invalidateQueries({ queryKey: ['patients'] });
      await queryClient.invalidateQueries({ queryKey: ['patient-options'] });
      setMessage('Paciente arquivado.');
      setMessageTone('success');
      setTimeout(() => setMessage(null), 4000);
    } catch (error: any) {
      setMessage(error.message);
      setMessageTone('danger');
      setTimeout(() => setMessage(null), 4000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <h1 className="text-2xl font-semibold">Pacientes</h1>
          <p className="text-sm text-muted-foreground">Gerencie cadastros, contatos e histórico clínico.</p>
        </div>
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            if (open) {
              setDialogOpen(true);
            } else {
              closeDialog();
            }
          }}
        >
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Novo paciente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? 'Editar paciente' : 'Cadastrar paciente'}</DialogTitle>
            </DialogHeader>
            {formError ? <Alert tone="danger" title={formError} /> : null}
            <PatientForm
              defaultValues={editing ?? undefined}
              submitting={formSubmitting}
              onSubmit={async (values) => {
                await submitForm(values);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou CPF"
            className="pl-9"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>
      {message ? <Alert tone={messageTone} title={message} /> : null}
      <div className="overflow-hidden rounded-2xl border bg-card">
        {isLoading ? (
          <div className="space-y-4 p-6">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : isError ? (
          <div className="p-6 text-sm text-destructive">Não foi possível carregar os pacientes.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>CPF</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Convênio</TableHead>
                <TableHead>Cadastro</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.items.map((paciente) => (
                <TableRow key={paciente.id} className={paciente.arquivado ? 'opacity-70' : ''}>
                  <TableCell className="font-medium">{paciente.nome}</TableCell>
                  <TableCell>{paciente.cpf}</TableCell>
                  <TableCell>
                    <div className="space-y-1 text-xs">
                      {paciente.email ? <p>{paciente.email}</p> : null}
                      {paciente.telefone ? <p>{paciente.telefone}</p> : null}
                    </div>
                  </TableCell>
                  <TableCell>{paciente.convenio ?? '—'}</TableCell>
                  <TableCell>{new Date(paciente.createdAt).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost" aria-label="Ações">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/pacientes/${paciente.id}`}>Ver detalhes</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setEditing(paciente);
                            setDialogOpen(true);
                          }}
                        >
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={async () => {
                            await handleArchive(paciente);
                          }}
                        >
                          Arquivar
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
    </div>
  );
}
