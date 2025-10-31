# Clínica Prisma — Controle de Pacientes

Sistema web completo para gestão de pacientes, agenda médica e prontuários clínicos. Construído com Next.js 14 (App Router), Tailwind CSS, shadcn/ui, Prisma e NextAuth.

## Funcionalidades
- Autenticação com controle de acesso por papéis (`admin`, `medico`, `recepcao`).
- Recuperação de senha com token e expiração.
- Cadastro, edição, busca, filtros, ordenação e arquivamento de pacientes.
- Agenda de consultas com prevenção de conflitos por médico, visualização em lista e calendário.
- Prontuário estruturado com anamnese, diagnóstico, prescrição e upload de anexos.
- Biblioteca clínica de documentos com categorias, filtros por paciente e anexos com preview.
- Relatórios com contagem de pacientes, consultas por status e por médico.
- Auditoria completa das operações sensíveis.
- Interface responsiva com modo claro/escuro, navegação por teclado e feedbacks acessíveis.
- Painel de configurações com personalização de tema, densidade, animações e modo glass.

## Requisitos
- Node.js 18+
- pnpm (recomendado) ou npm
- Banco PostgreSQL com URL em `DATABASE_URL`

## Configuração do ambiente
1. Crie o arquivo `.env.local` baseado em `.env.example`:
   ```env
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DB?sslmode=require"
   NEXTAUTH_SECRET="gera_um_secret"
   NEXTAUTH_URL="http://localhost:3000"
   STORAGE_BASE_URL="/uploads"
   ```
2. Instale dependências:
   ```bash
   pnpm install
   ```
3. Execute as migrações e seed inicial:
   ```bash
   pnpm prisma:generate
   pnpm prisma:migrate
   pnpm prisma:seed
   ```

Usuários padrão após o seed:
- `admin@local` / `Admin!234`
- `medico@local` / `Medico!234`
- `recepcao@local` / `Recepcao!234`

## Executando o projeto
```bash
pnpm dev
```
O servidor inicia em `http://localhost:3000`.

## Testes e qualidade
- Lint: `pnpm lint`
- Unitários e integração (Jest): `pnpm test`
- End-to-end (Playwright): `pnpm e2e` (reset automático do banco + seed antes dos testes)
- Verificação completa (lint + testes + e2e smoke): `pnpm verify`

Antes de rodar Playwright garanta que o banco está migrado e com seed atualizado:
```bash
pnpm db:reset
pnpm prisma:seed
pnpm e2e
```

## Deploy na Vercel
1. Crie o projeto na Vercel apontando para este repositório.
2. Defina as variáveis de ambiente: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `STORAGE_BASE_URL` (apontando para o bucket de produção).
3. Configure o banco (Neon/Supabase) e copie a URL para `DATABASE_URL`.
4. A Vercel executará `pnpm install`, `pnpm prisma:generate` e `pnpm prisma:deploy` (configure em *Build & Development Settings*).
5. Após o deploy rode `pnpm prisma:seed` manualmente ou via `vercel env pull` conforme necessário.

## Observações sobre armazenamento de anexos
Por padrão os arquivos são gravados em `public/uploads` para uso local. Em produção utilize um serviço de armazenamento (S3, UploadThing, etc.) e atualize `STORAGE_BASE_URL` para apontar para os arquivos públicos.

## Documentação adicional
- RBAC implementado em `lib/rbac.ts`.
- Rotas da API e Server Actions localizadas em `app/api/*`.
- Schema Prisma em `prisma/schema.prisma`.

## Personalização visual (tema Dr. David)

Há duas formas de ajustar a identidade do projeto:

1. **Ajustes sem código** — acesse o menu “Configurações” na aplicação (`/configuracoes`). Lá você encontra:
   - Seleção de tema claro, escuro ou automático.
   - Paleta de destaques (`Oceano`, `Violeta`, `Amanhecer`) com pré-visualização.
   - Densidade confortável/compacta, redução de animações e modo glass (transparências).
   As preferências ficam salvas no navegador e podem ser restauradas com um clique.

2. **Customização via código** — os arquivos a seguir concentram todos os pontos de cor e estilo:

   | Área | Arquivo | O que alterar |
   | --- | --- | --- |
   | Paleta global | `app/globals.css` (`:root`, `.dark` e blocos `body[data-brand=...]`) | Variáveis `--primary`, `--accent`, `--surface-*`, além das regras de densidade/animações. |
   | Gradientes de fundo | `app/globals.css` (seção `body { background-image: ... }`) | Ajuste os gradientes `radial-gradient` e `linear-gradient` para mudar a atmosfera do dashboard. |
   | Sidebar e cabeçalho | `components/layout/app-shell.tsx` | Classes `bg-gradient-to-*`, `bg-primary/*`, `shadow-primary/*` e `border-white/..` definem cores da navegação. |
   | Tela de login | `app/(auth)/login/page.tsx` | Gradientes `bg-gradient-to-br`, contêineres `bg-white/60`, `bg-primary/15` e animações `animate-float*`. |
   | Dashboard e listagens | `components/consultas/consultation-table.tsx`, `components/documentos/document-workspace.tsx`, `app/(dashboard)/pacientes/[id]/page.tsx`, `app/estoque/page.tsx` | Cards com classes `bg-white/XX`, `dark:bg-slate-9XX`, `border-white/YY` e `shadow-primary/ZZ`. |
   | Uploads e formulários | `components/pacientes/patient-documents.tsx`, `components/pacientes/patient-anamnesis.tsx` | Personalize campos e botões (`bg-gradient-to-r`, `border-primary/..`, `text-primary`). |

Após qualquer alteração salve os arquivos e rode `pnpm dev` para validar visualmente.
