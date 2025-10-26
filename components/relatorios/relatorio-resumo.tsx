import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResumoChart } from './resumo-chart';
import { headers } from 'next/headers';

interface RelatorioResponse {
  periodo: { start: string; end: string };
  novosPacientes: number;
  consultasPorStatus: Array<{ status: string; _count: { _all: number } }>;
  consultasPorMedico: Array<{ medicoId: string; medico: string; total: number }>;
}

export default async function RelatorioResumo() {
  const headerList = headers();
  const host = headerList.get('host');
  const effectiveHost = host ?? 'localhost:3000';
  const isLocalhost = effectiveHost.includes('localhost');
  const protocol = isLocalhost ? 'http' : 'https';
  const baseUrl = process.env.NEXTAUTH_URL ?? `${protocol}://${effectiveHost}`;
  const response = await fetch(`${baseUrl}/api/relatorios/resumo`, {
    cache: 'no-store'
  });
  if (!response.ok) {
    throw new Error('Não foi possível carregar o relatório.');
  }
  const data = (await response.json()) as RelatorioResponse;
  const periodo = `${new Date(data.periodo.start).toLocaleDateString('pt-BR')} a ${new Date(data.periodo.end).toLocaleDateString('pt-BR')}`;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Resumo do período</CardTitle>
          <p className="text-sm text-muted-foreground">{periodo}</p>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs uppercase text-muted-foreground">Novos pacientes</p>
            <p className="text-2xl font-semibold">{data.novosPacientes}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-muted-foreground">Total consultas</p>
            <p className="text-2xl font-semibold">
              {data.consultasPorStatus.reduce((acc, item) => acc + item._count._all, 0)}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase text-muted-foreground">Médicos em atendimento</p>
            <p className="text-2xl font-semibold">{data.consultasPorMedico.length}</p>
          </div>
        </CardContent>
      </Card>
      <ResumoChart status={data.consultasPorStatus} medicos={data.consultasPorMedico} />
    </div>
  );
}
