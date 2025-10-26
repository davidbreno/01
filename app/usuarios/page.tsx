import { Suspense } from "react";
import UsuariosTable from "@/components/usuarios/usuarios-table";

export default function UsuariosPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Usuários</h1>
      <Suspense fallback={<div>Carregando...</div>}>
        <UsuariosTable />
      </Suspense>
    </div>
  );
}
