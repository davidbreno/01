import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PatientTable } from '@/components/pacientes/patient-table';
import { AnamneseBoard } from '@/components/pacientes/anamnese-board';
import { DocumentBoard } from '@/components/pacientes/document-board';

export default function PacientesPage() {
  return (
    <div className="space-y-8 text-emerald-50">
      <header className="rounded-3xl border border-white/10 bg-gradient-to-r from-emerald-500/20 via-emerald-500/10 to-slate-900/60 p-8 shadow-lg shadow-emerald-500/10">
        <p className="text-sm uppercase tracking-[0.3em] text-emerald-200/70">Área clínica</p>
        <h1 className="mt-3 text-3xl font-semibold">Pacientes Dr. David</h1>
        <p className="mt-4 max-w-3xl text-sm text-emerald-100/70">
          Gerencie cadastros, acompanhe anamneses inteligentes e centralize documentos, imagens e receitas em um só lugar. Tudo
          sincronizado com a agenda para que cada atendimento seja personalizado.
        </p>
      </header>
      <Tabs defaultValue="cadastros" className="w-full">
        <TabsList className="w-full justify-start gap-4 rounded-2xl border border-white/10 bg-black/30 p-2">
          <TabsTrigger value="cadastros" className="rounded-xl px-4 py-2 data-[state=active]:bg-emerald-500/30 data-[state=active]:text-white">
            Cadastros
          </TabsTrigger>
          <TabsTrigger value="anamnese" className="rounded-xl px-4 py-2 data-[state=active]:bg-cyan-500/30 data-[state=active]:text-white">
            Anamnese
          </TabsTrigger>
          <TabsTrigger value="documentos" className="rounded-xl px-4 py-2 data-[state=active]:bg-blue-500/20 data-[state=active]:text-white">
            Documentos
          </TabsTrigger>
        </TabsList>
        <TabsContent value="cadastros" className="mt-6">
          <PatientTable />
        </TabsContent>
        <TabsContent value="anamnese" className="mt-6">
          <AnamneseBoard />
        </TabsContent>
        <TabsContent value="documentos" className="mt-6">
          <DocumentBoard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
