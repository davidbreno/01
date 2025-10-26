import { Suspense } from 'react';
import RelatorioResumo from '@/components/relatorios/relatorio-resumo';

export default function RelatoriosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Relatórios</h1>
        <p className="text-sm text-muted-foreground">Indicadores de pacientes e consultas por período.</p>
      </div>
      <Suspense fallback={<div className="rounded-2xl border bg-card p-6 text-sm text-muted-foreground">Carregando métricas…</div>}>
        <RelatorioResumo />
      </Suspense>
    </div>
  );
}
