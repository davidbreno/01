import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

// Componente genérico para formulário de material
function MaterialForm({ title, fields }: { title: string; fields: any[] }) {
  return (
    <form className="border rounded-lg p-6 bg-white shadow-sm space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl font-bold text-blue-700">{title}</span>
        <span className="h-1 w-8 bg-blue-200 rounded" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {fields.map((field, idx) => (
          <div key={idx} className="flex flex-col">
            <label className="block text-base font-medium mb-2 text-gray-700" htmlFor={field.name}>{field.label}</label>
            {field.options ? (
              <select id={field.name} name={field.name} className="border rounded px-3 py-2 w-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400">
                <option value="">Selecione...</option>
                {field.options.map((opt: string) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : (
              <input
                id={field.name}
                name={field.name}
                type={field.type || "text"}
                placeholder={field.label}
                className="border rounded px-3 py-2 w-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            )}
          </div>
        ))}
      </div>
      <button type="submit" className="mt-6 bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700 transition">Registrar {title}</button>
    </form>
  );
}

export default function EstoquePage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Estoque de Materiais</h1>
      <Tabs defaultValue="cirurgia">
        <TabsList className="mb-6">
          <TabsTrigger value="cirurgia">Cirurgia</TabsTrigger>
          <TabsTrigger value="implante">Implante</TabsTrigger>
          <TabsTrigger value="dentistica">Dentística</TabsTrigger>
        </TabsList>
        <TabsContent value="cirurgia">
          <div className="space-y-8">
            <MaterialForm
              title="Anestésicos"
              fields={[{ label: "Tipo", name: "tipo" }, { label: "Quantidade", name: "quantidade", type: "number" }, { label: "Validade", name: "validade", type: "date" }]}
            />
            <MaterialForm
              title="Bisturi"
              fields={[{ label: "Modelo/Tamanho", name: "modelo" }, { label: "Quantidade", name: "quantidade", type: "number" }, { label: "Material", name: "material" }]}
            />
            <MaterialForm
              title="Fio de Sutura"
              fields={[{ label: "Quantidade", name: "quantidade", type: "number" }, { label: "Marca", name: "marca" }, { label: "Numeração", name: "numeracao" }]}
            />
            <MaterialForm
              title="Kit Cirúrgico"
              fields={[{ label: "Sugador Cirúrgico (Quantidade)", name: "sugador", type: "number" }]}
            />
            <MaterialForm
              title="Luva Estéril"
              fields={[{ label: "Tamanho", name: "tamanho" }, { label: "Quantidade", name: "quantidade", type: "number" }]}
            />
            <MaterialForm
              title="Agulha"
              fields={[{ label: "Quantidade", name: "quantidade", type: "number" }, { label: "Tipo (Longa/Curta)", name: "tipo", options: ["Longa", "Curta"] }]}
            />
          </div>
        </TabsContent>
        <TabsContent value="implante">
          <div className="space-y-8">
            <MaterialForm
              title="Implante"
              fields={[{ label: "Tipo", name: "tipo", options: ["he", "cm", "OI", "hi"] }, { label: "Tamanho", name: "tamanho" }, { label: "Marca", name: "marca" }, { label: "Diâmetro", name: "diametro" }]}
            />
          </div>
        </TabsContent>
        <TabsContent value="dentistica">
          <div className="space-y-8">
            <MaterialForm
              title="Resina"
              fields={[{ label: "Cor", name: "cor" }, { label: "Marca", name: "marca" }, { label: "Quantidade", name: "quantidade", type: "number" }]}
            />
            <MaterialForm
              title="Adesivo"
              fields={[{ label: "Marca", name: "marca" }, { label: "Quantidade", name: "quantidade", type: "number" }]}
            />
            <MaterialForm
              title="Teflon"
              fields={[{ label: "Quantidade", name: "quantidade", type: "number" }]}
            />
            <MaterialForm
              title="Ácido"
              fields={[{ label: "Quantidade", name: "quantidade", type: "number" }]}
            />
            <MaterialForm
              title="Microbrush"
              fields={[{ label: "Quantidade", name: "quantidade", type: "number" }]}
            />
            <MaterialForm
              title="Fotopolimerizador"
              fields={[{ label: "Marca", name: "marca" }]}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
