import React, { useEffect, useState } from "react";

const roles = ["ADMIN", "MEDICO", "RECEPCAO"];

export default function UsuariosTable() {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "ADMIN", password: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/usuarios")
      .then((res) => res.json())
      .then((data) => {
        setUsuarios(data);
        setLoading(false);
      });
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/usuarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    setShowModal(false);
    setSaving(false);
    setForm({ name: "", email: "", role: "ADMIN", password: "" });
    setLoading(true);
    fetch("/api/usuarios")
      .then((res) => res.json())
      .then((data) => {
        setUsuarios(data);
        setLoading(false);
      });
  };

  if (loading) {
    return <div>Carregando usuários...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b">
            <th className="py-2 px-4">Nome</th>
            <th className="py-2 px-4">Email</th>
            <th className="py-2 px-4">Papel</th>
            <th className="py-2 px-4">Ações</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((user) => (
            <tr key={user.id} className="border-b hover:bg-gray-50">
              <td className="py-2 px-4">{user.name}</td>
              <td className="py-2 px-4">{user.email}</td>
              <td className="py-2 px-4">{user.role}</td>
              <td className="py-2 px-4">
                <button className="text-blue-600 hover:underline mr-2">Editar</button>
                <button className="text-red-600 hover:underline" onClick={() => {
                  if (window.confirm(`Deseja realmente excluir o usuário ${user.name}?`)) {
                    fetch(`/api/usuarios?id=${user.id}`, { method: 'DELETE' })
                      .then(() => {
                        setLoading(true);
                        fetch("/api/usuarios")
                          .then((res) => res.json())
                          .then((data) => {
                            setUsuarios(data);
                            setLoading(false);
                          });
                      });
                  }
                }}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onClick={() => setShowModal(true)}>
        Cadastrar Usuário
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Cadastrar Usuário</h2>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Nome</label>
              <input name="name" value={form.name} onChange={handleInput} required className="border rounded px-3 py-2 w-full" placeholder="Nome completo" />
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Email</label>
              <input name="email" type="email" value={form.email} onChange={handleInput} required className="border rounded px-3 py-2 w-full" placeholder="email@exemplo.com" />
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Senha</label>
              <input name="password" type="password" value={form.password} onChange={handleInput} required className="border rounded px-3 py-2 w-full" placeholder="Senha" />
            </div>
            <div className="mb-6">
              <label className="block mb-1 font-medium">Papel</label>
              <select name="role" value={form.role} onChange={handleInput} className="border rounded px-3 py-2 w-full" title="Papel do usuário">
                {roles.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 justify-end">
              <button type="button" className="px-4 py-2 rounded bg-gray-200" onClick={() => setShowModal(false)} disabled={saving}>Cancelar</button>
              <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white" disabled={saving}>{saving ? "Salvando..." : "Salvar"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
