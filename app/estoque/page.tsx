import { Suspense } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImplantPanel } from '@/components/estoque/implant-panel';
import { MaterialPanel } from '@/components/estoque/material-panel';
import { Skeleton } from '@/components/ui/skeleton';

export default function EstoquePage() {
  return (
    <div className="space-y-8 text-emerald-50">
      <header className="rounded-3xl border border-white/10 bg-gradient-to-r from-emerald-500/20 via-cyan-500/10 to-slate-900/60 p-8 shadow-xl shadow-emerald-500/10">
        <p className="text-sm uppercase tracking-[0.3em] text-emerald-200/70">Central de suprimentos</p>
        <h1 className="mt-3 text-3xl font-semibold">Estoque Dr. David</h1>
        <p className="mt-4 max-w-2xl text-sm text-emerald-100/70">
          Controle implantes CMI, HE e HI TAPA, além de materiais odontológicos essenciais. Cadastre itens, ajuste quantidades em
          tempo real e mantenha toda a clínica sincronizada para o próximo procedimento.
        </p>
      </header>
      <Tabs defaultValue="implantes" className="w-full">
        <TabsList className="w-full justify-start gap-4 rounded-2xl border border-white/10 bg-black/30 p-2">
          <TabsTrigger value="implantes" className="rounded-xl px-4 py-2 data-[state=active]:bg-emerald-500/30 data-[state=active]:text-white">
            Implantes
          </TabsTrigger>
          <TabsTrigger value="materiais" className="rounded-xl px-4 py-2 data-[state=active]:bg-cyan-500/30 data-[state=active]:text-white">
            Materiais
          </TabsTrigger>
        </TabsList>
        <TabsContent value="implantes" className="mt-6">
          <Suspense
            fallback={
              <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
                <Skeleton className="h-[520px] rounded-2xl bg-white/10" />
                <Skeleton className="h-[520px] rounded-2xl bg-white/10" />
              </div>
            }
          >
            <ImplantPanel />
          </Suspense>
        </TabsContent>
        <TabsContent value="materiais" className="mt-6">
          <Suspense
            fallback={
              <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
                <Skeleton className="h-[520px] rounded-2xl bg-white/10" />
                <Skeleton className="h-[520px] rounded-2xl bg-white/10" />
              </div>
            }
          >
            <MaterialPanel />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
