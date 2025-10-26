import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getRelatorioResumo } from '@/lib/services/relatorios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { formatDate } from '@/lib/utils';
import { Role, Status } from '@prisma/client';

const STATUS_LABELS: Record<Status, string> = {
  AGENDADA: 'Agendada',
  CONFIRMADA: 'Confirmada',
  CANCELADA: 'Cancelada',
  CONCLUIDA: 'Concluída'
};

async function getSummary(role: Role) {
  const [resumo, consultasProximas] = await Promise.all([
    getRelatorioResumo(),
    prisma.consulta.findMany({
      where: {
        inicio: { gte: new Date() },
        status: { in: [Status.AGENDADA, Status.CONFIRMADA] }
      },
      include: { paciente: true, medico: true },
      orderBy: { inicio: 'asc' },
      take: 5
    })
  ]);

  return {
    pacientes: resumo.novosPacientes,
    consultasProximas,
    consultasPorStatus: resumo.consultasPorStatus,
    consultasPorMedico: resumo.consultasPorMedico,
    role
  };
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user;
  if (!user) {
    return null;
  }

  const summary = await getSummary(user.role);

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <Card className="lg:col-span-4">
        <CardHeader>
          <CardTitle>Novos pacientes (30 dias)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-semibold">{summary.pacientes}</p>
          <p className="mt-2 text-sm text-muted-foreground">Taxa de crescimento acompanhada semanalmente.</p>
        </CardContent>
      </Card>

      <Card className="lg:col-span-4">
        <CardHeader>
          <CardTitle>Consultas por status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {summary.consultasPorStatus.map((item) => (
            <div key={item.status} className="flex items-center justify-between text-sm">
              <span>{STATUS_LABELS[item.status]}</span>
              <Badge variant="secondary">{item._count._all}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="lg:col-span-4">
        <CardHeader>
          <CardTitle>Consultas por médico</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {summary.consultasPorMedico.map((item) => (
            <div key={item.medicoId} className="flex items-center justify-between text-sm">
              <span>{item.medico}</span>
              <Badge variant="secondary">{item.total}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="lg:col-span-6">
        <CardHeader>
          <CardTitle>Próximas consultas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {summary.consultasProximas.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma consulta agendada para os próximos dias.</p>
          ) : (
            summary.consultasProximas.map((consulta) => (
              <div key={consulta.id} className="rounded-xl border p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{consulta.paciente.nome}</p>
                    <p className="text-xs text-muted-foreground">{consulta.medico.name}</p>
                  </div>
                  <Badge>
                    {format(new Date(consulta.inicio), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                  </Badge>
                </div>
                {consulta.notas ? <p className="mt-3 text-xs text-muted-foreground">{consulta.notas}</p> : null}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="lg:col-span-6">
        <CardHeader>
          <CardTitle>Atualizações recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <RecentUpdates />
        </CardContent>
      </Card>
    </div>
  );
}

async function RecentUpdates() {
  const logs = await prisma.auditLog.findMany({
    take: 8,
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { name: true } } }
  });

  if (logs.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhuma atividade registrada ainda.</p>;
  }

  return (
    <ul className="space-y-3">
      {logs.map((log) => (
        <li key={log.id} className="rounded-xl border p-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{log.user?.name ?? 'Sistema'}</span>
            <span>{formatDate(log.createdAt)}</span>
          </div>
          <p className="mt-2 text-sm font-medium text-foreground">
            {log.action.replaceAll('_', ' ')} - {log.entity}
          </p>
        </li>
      ))}
    </ul>
  );
}
