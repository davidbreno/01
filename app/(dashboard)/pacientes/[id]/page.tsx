import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, ClipboardList, Mail, Phone } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { ProntuarioForm } from '@/components/prontuarios/prontuario-form';
import { Status } from '@prisma/client';

const STATUS_LABELS: Record<Status, string> = {
  AGENDADA: 'Agendada',
  CONFIRMADA: 'Confirmada',
  CANCELADA: 'Cancelada',
  CONCLUIDA: 'Concluída'
};

interface PageProps {
  params: { id: string };
}

export default async function PacienteDetalhePage({ params }: PageProps) {
  const paciente = await prisma.paciente.findUnique({
    where: { id: params.id },
    include: {
      consultas: { orderBy: { inicio: 'desc' }, include: { medico: true } },
      prontuarios: {
        orderBy: { createdAt: 'desc' },
        include: { criadoPor: true, consulta: true, anexos: true }
      }
    }
  });

  if (!paciente) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/pacientes" className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>
      </div>
      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Perfil do paciente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <p className="text-lg font-semibold">{paciente.nome}</p>
              <p className="text-xs text-muted-foreground">CPF {paciente.cpf}</p>
            </div>
            <div className="space-y-1">
              <p className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Nascimento {formatDate(paciente.nascimento)}</p>
              <p className="flex items-center gap-2"><ClipboardList className="h-4 w-4" /> Plano {paciente.convenio ?? 'Particular'}</p>
              {paciente.carteirinha ? (
                <p className="flex items-center gap-2">
                  <Badge variant="secondary">Carteirinha {paciente.carteirinha}</Badge>
                </p>
              ) : null}
              {paciente.email ? (
                <p className="flex items-center gap-2"><Mail className="h-4 w-4" /> {paciente.email}</p>
              ) : null}
              {paciente.telefone ? (
                <p className="flex items-center gap-2"><Phone className="h-4 w-4" /> {paciente.telefone}</p>
              ) : null}
            </div>
            {paciente.alergias ? (
              <div>
                <h3 className="text-xs font-semibold uppercase text-muted-foreground">Alergias</h3>
                <p>{paciente.alergias}</p>
              </div>
            ) : null}
            {paciente.observacoes ? (
              <div>
                <h3 className="text-xs font-semibold uppercase text-muted-foreground">Observações</h3>
                <p>{paciente.observacoes}</p>
              </div>
            ) : null}
          </CardContent>
        </Card>
        <div className="space-y-6 lg:col-span-8">
          <Card>
            <CardHeader>
              <CardTitle>Registro clínico</CardTitle>
            </CardHeader>
            <CardContent>
              <ProntuarioForm pacienteId={paciente.id} consultas={paciente.consultas} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Histórico de atendimentos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {paciente.prontuarios.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum atendimento registrado.</p>
              ) : (
                paciente.prontuarios.map((registro) => (
                  <div key={registro.id} className="rounded-xl border p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
                      <span>{formatDate(registro.createdAt)}</span>
                      <span>{registro.criadoPor?.name}</span>
                    </div>
                    <div className="mt-3 space-y-2 text-sm">
                      {registro.conteudo?.anamnese ? (
                        <div>
                          <h4 className="font-semibold">Anamnese</h4>
                          <p className="text-muted-foreground">{registro.conteudo.anamnese}</p>
                        </div>
                      ) : null}
                      {registro.conteudo?.diagnostico ? (
                        <div>
                          <h4 className="font-semibold">Diagnóstico</h4>
                          <p className="text-muted-foreground">{registro.conteudo.diagnostico}</p>
                        </div>
                      ) : null}
                      {registro.conteudo?.prescricao ? (
                        <div>
                          <h4 className="font-semibold">Prescrição</h4>
                          <p className="text-muted-foreground">{registro.conteudo.prescricao}</p>
                        </div>
                      ) : null}
                      {registro.conteudo?.observacoes ? (
                        <div>
                          <h4 className="font-semibold">Observações</h4>
                          <p className="text-muted-foreground">{registro.conteudo.observacoes}</p>
                        </div>
                      ) : null}
                    </div>
                    {registro.anexos.length ? (
                      <div className="mt-3 space-y-2">
                        <h4 className="text-xs font-semibold uppercase text-muted-foreground">Anexos</h4>
                        <ul className="space-y-1 text-sm">
                          {registro.anexos.map((anexo) => (
                            <li key={anexo.id}>
                              <a href={anexo.url} className="text-primary" target="_blank" rel="noreferrer">
                                {anexo.mime}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Consultas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {paciente.consultas.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma consulta agendada.</p>
              ) : (
                paciente.consultas.map((consulta) => (
                  <div key={consulta.id} className="rounded-xl border p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                      <div>
                        <p className="font-medium">{consulta.medico.name}</p>
                        <p className="text-xs text-muted-foreground">{STATUS_LABELS[consulta.status]}</p>
                      </div>
                      <Badge variant="secondary">{formatDate(consulta.inicio)}</Badge>
                    </div>
                    {consulta.notas ? <p className="mt-3 text-xs text-muted-foreground">{consulta.notas}</p> : null}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
