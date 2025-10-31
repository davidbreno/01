'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Loader2, Warehouse, Boxes } from 'lucide-react';

interface ImplantItem {
  id: string;
  categoria: 'CMI' | 'HE' | 'HI_TAPA';
  modelo: string;
  tamanho: string;
  marca: string;
  quantidade: number;
  imagemUrl?: string | null;
  createdAt: string;
}

interface MaterialItem {
  id: string;
  nome: string;
  categoria: string;
  marca?: string | null;
  modelo?: string | null;
  unidade?: string | null;
  quantidade: number;
  createdAt: string;
}

const CATEGORIA_LABEL: Record<ImplantItem['categoria'], string> = {
  CMI: 'CMI',
  HE: 'HE',
  HI_TAPA: 'HI Tapa'
};

export default function EstoquePage() {
  const [implants, setImplants] = useState<ImplantItem[]>([]);
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [loadingImplants, setLoadingImplants] = useState(true);
  const [loadingMaterials, setLoadingMaterials] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [implantForm, setImplantForm] = useState({
    categoria: 'CMI',
    modelo: '',
    tamanho: '',
    marca: '',
    quantidade: 0,
    imagem: null as File | null
  });
  const [materialForm, setMaterialForm] = useState({
    nome: '',
    categoria: '',
    marca: '',
    modelo: '',
    unidade: '',
    quantidade: 0
  });
  const [savingImplant, setSavingImplant] = useState(false);
  const [savingMaterial, setSavingMaterial] = useState(false);

  const loadImplants = async () => {
    setLoadingImplants(true);
    try {
      const response = await fetch('/api/estoque/implantes?pageSize=50');
      if (!response.ok) throw new Error('Erro ao consultar implantes.');
      const data = await response.json();
      setImplants(data.items ?? []);
    } catch (err: any) {
      setError(err.message ?? 'Erro ao consultar implantes.');
    } finally {
      setLoadingImplants(false);
    }
  };

  const loadMaterials = async () => {
    setLoadingMaterials(true);
    try {
      const response = await fetch('/api/estoque/materiais?pageSize=50');
      if (!response.ok) throw new Error('Erro ao consultar materiais.');
      const data = await response.json();
      setMaterials(data.items ?? []);
    } catch (err: any) {
      setError(err.message ?? 'Erro ao consultar materiais.');
    } finally {
      setLoadingMaterials(false);
    }
  };

  useEffect(() => {
    loadImplants();
    loadMaterials();
  }, []);

  const handleImplantSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    if (!implantForm.modelo.trim() || !implantForm.tamanho.trim() || !implantForm.marca.trim()) {
      setError('Preencha modelo, tamanho e marca do implante.');
      return;
    }
    setSavingImplant(true);
    try {
      let imagemUrl: string | undefined;
      if (implantForm.imagem) {
        const data = new FormData();
        data.append('file', implantForm.imagem);
        const upload = await fetch('/api/upload', { method: 'POST', body: data });
        if (!upload.ok) {
          const payload = await upload.json().catch(() => ({}));
          throw new Error(payload.error ?? 'Falha ao enviar imagem do implante.');
        }
        const uploaded = await upload.json();
        imagemUrl = uploaded.url;
      }
      const response = await fetch('/api/estoque/implantes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoria: implantForm.categoria,
          modelo: implantForm.modelo.trim(),
          tamanho: implantForm.tamanho.trim(),
          marca: implantForm.marca.trim(),
          quantidade: Number(implantForm.quantidade),
          imagemUrl: imagemUrl ?? null
        })
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error ?? 'Erro ao salvar implante.');
      }
      const created: ImplantItem = await response.json();
      setImplants((prev) => [created, ...prev]);
      setMessage('Implante registrado com sucesso.');
      setImplantForm({ categoria: 'CMI', modelo: '', tamanho: '', marca: '', quantidade: 0, imagem: null });
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      setError(err.message ?? 'Falha ao registrar implante.');
    } finally {
      setSavingImplant(false);
    }
  };

  const handleMaterialSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    if (!materialForm.nome.trim() || !materialForm.categoria.trim()) {
      setError('Informe o nome e a categoria do material.');
      return;
    }
    setSavingMaterial(true);
    try {
      const response = await fetch('/api/estoque/materiais', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: materialForm.nome.trim(),
          categoria: materialForm.categoria.trim(),
          marca: materialForm.marca.trim() || null,
          modelo: materialForm.modelo.trim() || null,
          unidade: materialForm.unidade.trim() || null,
          quantidade: Number(materialForm.quantidade)
        })
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error ?? 'Erro ao salvar material.');
      }
      const created: MaterialItem = await response.json();
      setMaterials((prev) => [created, ...prev]);
      setMessage('Material registrado com sucesso.');
      setMaterialForm({ nome: '', categoria: '', marca: '', modelo: '', unidade: '', quantidade: 0 });
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      setError(err.message ?? 'Falha ao registrar material.');
    } finally {
      setSavingMaterial(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-white/70 p-6 shadow-xl shadow-primary/10 backdrop-blur dark:bg-slate-950/70">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-primary/70">Estoque inteligente</p>
            <h1 className="text-3xl font-semibold text-foreground">Central de implantes e materiais</h1>
            <p className="text-sm text-muted-foreground">
              Cadastre itens, acompanhe quantidades e mantenha o acervo do Dr. David atualizado.
            </p>
          </div>
        </div>
        {message ? <Alert tone="success" title={message} className="mt-4" /> : null}
        {error ? <Alert tone="danger" title={error} className="mt-4" /> : null}
      </div>
      <Tabs defaultValue="implantes" className="space-y-6">
        <TabsList className="rounded-full bg-primary/10 p-1">
          <TabsTrigger value="implantes" className="rounded-full px-6 py-2 text-sm font-semibold">
            Implantes
          </TabsTrigger>
          <TabsTrigger value="materiais" className="rounded-full px-6 py-2 text-sm font-semibold">
            Materiais
          </TabsTrigger>
        </TabsList>
        <TabsContent value="implantes" className="space-y-6">
          <form
            onSubmit={handleImplantSubmit}
            className="space-y-4 rounded-3xl border border-primary/15 bg-white/70 p-6 shadow-inner shadow-primary/10 backdrop-blur dark:bg-slate-950/70"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-primary/70">Novo implante</p>
                <h2 className="text-lg font-semibold text-foreground">Registrar item com foto</h2>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Warehouse className="h-5 w-5" />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria</Label>
                <select
                  id="categoria"
                  value={implantForm.categoria}
                  onChange={(event) => setImplantForm((prev) => ({ ...prev, categoria: event.target.value }))}
                  className="h-11 w-full rounded-xl border border-primary/20 bg-white/80 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 dark:bg-slate-900"
                >
                  <option value="CMI">CMI</option>
                  <option value="HE">HE</option>
                  <option value="HI_TAPA">HI Tapa</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="modelo">Modelo</Label>
                <Input
                  id="modelo"
                  value={implantForm.modelo}
                  onChange={(event) => setImplantForm((prev) => ({ ...prev, modelo: event.target.value }))}
                  className="h-11 rounded-xl border-primary/20 bg-white/80 focus-visible:ring-primary"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tamanho">Tamanho</Label>
                <Input
                  id="tamanho"
                  value={implantForm.tamanho}
                  onChange={(event) => setImplantForm((prev) => ({ ...prev, tamanho: event.target.value }))}
                  className="h-11 rounded-xl border-primary/20 bg-white/80 focus-visible:ring-primary"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="marca">Marca</Label>
                <Input
                  id="marca"
                  value={implantForm.marca}
                  onChange={(event) => setImplantForm((prev) => ({ ...prev, marca: event.target.value }))}
                  className="h-11 rounded-xl border-primary/20 bg-white/80 focus-visible:ring-primary"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantidade">Quantidade</Label>
                <Input
                  id="quantidade"
                  type="number"
                  min={0}
                  value={implantForm.quantidade}
                  onChange={(event) => setImplantForm((prev) => ({ ...prev, quantidade: Number(event.target.value) }))}
                  className="h-11 rounded-xl border-primary/20 bg-white/80 focus-visible:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="imagem">Imagem</Label>
                <Input
                  id="imagem"
                  type="file"
                  accept="image/*"
                  className="h-11 cursor-pointer rounded-xl border-primary/20 bg-white/80 file:mr-4 file:rounded-full file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-primary"
                  onChange={(event) => setImplantForm((prev) => ({ ...prev, imagem: event.target.files?.[0] ?? null }))}
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full rounded-2xl bg-gradient-to-r from-primary via-primary/90 to-accent font-semibold shadow-lg shadow-primary/30 hover:scale-[1.01]"
              disabled={savingImplant}
            >
              {savingImplant ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Registrando…
                </>
              ) : (
                'Salvar implante'
              )}
            </Button>
          </form>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {loadingImplants ? (
              <div className="col-span-full flex items-center gap-2 rounded-3xl border border-white/10 bg-white/70 p-6 text-sm text-muted-foreground shadow-inner dark:bg-slate-900/70">
                <Loader2 className="h-4 w-4 animate-spin" /> Carregando implantes…
              </div>
            ) : implants.length === 0 ? (
              <p className="col-span-full text-sm text-muted-foreground">Nenhum implante cadastrado.</p>
            ) : (
              implants.map((implant) => (
                <div
                  key={implant.id}
                  className="flex flex-col gap-3 rounded-3xl border border-white/15 bg-white/80 p-5 shadow-md shadow-primary/10 dark:bg-slate-900/70"
                >
                  {implant.imagemUrl ? (
                    <div className="relative h-36 w-full overflow-hidden rounded-2xl bg-primary/5">
                      <Image src={implant.imagemUrl} alt={implant.modelo} fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="flex h-36 items-center justify-center rounded-2xl border border-dashed border-primary/20 bg-primary/5 text-xs text-primary/60">
                      Sem imagem
                    </div>
                  )}
                  <div>
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      {CATEGORIA_LABEL[implant.categoria]}
                    </span>
                    <h3 className="mt-2 text-base font-semibold text-foreground">{implant.modelo}</h3>
                    <p className="text-xs text-muted-foreground">{implant.marca} • {implant.tamanho}</p>
                  </div>
                  <div className="mt-auto flex items-center justify-between text-sm text-muted-foreground">
                    <span className="font-medium text-primary">{implant.quantidade} unidades</span>
                    <span>{new Date(implant.createdAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>
        <TabsContent value="materiais" className="space-y-6">
          <form
            onSubmit={handleMaterialSubmit}
            className="space-y-4 rounded-3xl border border-primary/15 bg-white/70 p-6 shadow-inner shadow-primary/10 backdrop-blur dark:bg-slate-950/70"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-primary/70">Novo material</p>
                <h2 className="text-lg font-semibold text-foreground">Registrar insumo odontológico</h2>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Boxes className="h-5 w-5" />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="material-nome">Nome</Label>
                <Input
                  id="material-nome"
                  value={materialForm.nome}
                  onChange={(event) => setMaterialForm((prev) => ({ ...prev, nome: event.target.value }))}
                  className="h-11 rounded-xl border-primary/20 bg-white/80 focus-visible:ring-primary"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="material-categoria">Categoria</Label>
                <Input
                  id="material-categoria"
                  value={materialForm.categoria}
                  onChange={(event) => setMaterialForm((prev) => ({ ...prev, categoria: event.target.value }))}
                  className="h-11 rounded-xl border-primary/20 bg-white/80 focus-visible:ring-primary"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="material-marca">Marca</Label>
                <Input
                  id="material-marca"
                  value={materialForm.marca}
                  onChange={(event) => setMaterialForm((prev) => ({ ...prev, marca: event.target.value }))}
                  className="h-11 rounded-xl border-primary/20 bg-white/80 focus-visible:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="material-modelo">Modelo</Label>
                <Input
                  id="material-modelo"
                  value={materialForm.modelo}
                  onChange={(event) => setMaterialForm((prev) => ({ ...prev, modelo: event.target.value }))}
                  className="h-11 rounded-xl border-primary/20 bg-white/80 focus-visible:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="material-unidade">Unidade</Label>
                <Input
                  id="material-unidade"
                  value={materialForm.unidade}
                  onChange={(event) => setMaterialForm((prev) => ({ ...prev, unidade: event.target.value }))}
                  className="h-11 rounded-xl border-primary/20 bg-white/80 focus-visible:ring-primary"
                  placeholder="Ex: caixa, frasco"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="material-quantidade">Quantidade</Label>
                <Input
                  id="material-quantidade"
                  type="number"
                  min={0}
                  value={materialForm.quantidade}
                  onChange={(event) => setMaterialForm((prev) => ({ ...prev, quantidade: Number(event.target.value) }))}
                  className="h-11 rounded-xl border-primary/20 bg-white/80 focus-visible:ring-primary"
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full rounded-2xl bg-gradient-to-r from-primary via-primary/90 to-accent font-semibold shadow-lg shadow-primary/30 hover:scale-[1.01]"
              disabled={savingMaterial}
            >
              {savingMaterial ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Registrando…
                </>
              ) : (
                'Salvar material'
              )}
            </Button>
          </form>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {loadingMaterials ? (
              <div className="col-span-full flex items-center gap-2 rounded-3xl border border-white/10 bg-white/70 p-6 text-sm text-muted-foreground shadow-inner dark:bg-slate-900/70">
                <Loader2 className="h-4 w-4 animate-spin" /> Carregando materiais…
              </div>
            ) : materials.length === 0 ? (
              <p className="col-span-full text-sm text-muted-foreground">Nenhum material cadastrado.</p>
            ) : (
              materials.map((material) => (
                <div
                  key={material.id}
                  className="flex flex-col gap-3 rounded-3xl border border-white/15 bg-white/80 p-5 shadow-md shadow-primary/10 dark:bg-slate-900/70"
                >
                  <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-muted-foreground">
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      {material.categoria}
                    </span>
                    <span>{new Date(material.createdAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">{material.nome}</h3>
                    <p className="text-xs text-muted-foreground">
                      {[material.marca, material.modelo].filter(Boolean).join(' • ')}
                    </p>
                  </div>
                  <div className="mt-auto flex items-center justify-between text-sm text-muted-foreground">
                    <span className="font-medium text-primary">{material.quantidade} {material.unidade || 'unid.'}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
