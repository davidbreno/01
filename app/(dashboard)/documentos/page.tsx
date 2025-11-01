import { DocumentBoard } from '@/components/pacientes/document-board';

export default function DocumentosPage() {
  return (
    <div className="space-y-8 text-emerald-50">
      <header className="rounded-3xl border border-white/10 bg-gradient-to-r from-blue-500/20 via-cyan-500/10 to-slate-900/60 p-8 shadow-lg shadow-blue-500/10">
        <p className="text-sm uppercase tracking-[0.3em] text-emerald-200/70">Central de arquivos</p>
        <h1 className="mt-3 text-3xl font-semibold">Documentos clínicos</h1>
        <p className="mt-4 max-w-3xl text-sm text-emerald-100/70">
          Armazene receitas, prontuários, documentos pessoais e radiografias com segurança. Classifique por paciente, organize por
          tipo e compartilhe com a equipe em segundos.
        </p>
      </header>
      <DocumentBoard />
    </div>
  );
}
