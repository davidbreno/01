import { getRelatorioResumo } from '@/lib/services/relatorios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResumoChart } from './resumo-chart';

export default async function RelatorioResumo() {
  try {
    const data = await getRelatorioResumo();
    const periodo = `${data.periodo.start.toLocaleDateString('pt-BR')} a ${data.periodo.end.toLocaleDateString('pt-BR')}`;

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
  } catch (error) {
    console.error('Falha ao carregar relatório resumo', error);
    return (
      <Card>
        <CardHeader>
          <CardTitle>Resumo do período</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Não foi possível carregar o relatório agora. Tente novamente em instantes.
          </p>
        </CardContent>
      </Card>
    );
  }
}
