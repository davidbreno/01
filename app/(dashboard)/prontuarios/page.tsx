import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

export default async function ProntuariosPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'MEDICO')) {
    return (
      <div className="rounded-2xl border bg-card p-6 text-sm text-muted-foreground">Acesso restrito aos médicos e administradores.</div>
    );
  }
  const registros = await prisma.prontuario.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20,
    include: { paciente: true, criadoPor: true, consulta: { include: { medico: true } } }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Prontuários</h1>
        <p className="text-sm text-muted-foreground">Registros recentes de atendimento clínico.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {registros.map((registro) => (
          <Card key={registro.id} className="space-y-2">
            <CardHeader>
              <CardTitle className="text-lg">{registro.paciente.nome}</CardTitle>
              <p className="text-xs text-muted-foreground">
                {formatDate(registro.createdAt)} — {registro.criadoPor?.name}
              </p>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {registro.conteudo?.anamnese ? (
                <div>
                  <h3 className="font-semibold">Anamnese</h3>
                  <p className="text-muted-foreground">{registro.conteudo.anamnese}</p>
                </div>
              ) : null}
              {registro.conteudo?.diagnostico ? (
                <div>
                  <h3 className="font-semibold">Diagnóstico</h3>
                  <p className="text-muted-foreground">{registro.conteudo.diagnostico}</p>
                </div>
              ) : null}
              {registro.conteudo?.prescricao ? (
                <div>
                  <h3 className="font-semibold">Prescrição</h3>
                  <p className="text-muted-foreground">{registro.conteudo.prescricao}</p>
                </div>
              ) : null}
              <Link href={`/pacientes/${registro.pacienteId}`} className="text-sm text-primary">
                Ver prontuário completo
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
