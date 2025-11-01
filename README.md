# Plataforma Dr. David — Odontologia Integrada

Dashboard moderno em Next.js 14 (App Router) para gerenciamento completo da clínica Dr. David. Controle pacientes, anamneses,
agendas, estoque, documentos e preferências de interface com visual imersivo e suporte a deploy na Vercel.

## Tecnologias

- Next.js 14 com App Router e renderização híbrida
- TypeScript, React 18 e React Query para dados reativos
- Tailwind CSS com tema personalizado e modo escuro
- Prisma ORM + PostgreSQL
- NextAuth com credenciais e controle de sessão
- Upload local (filesystem) pronto para troca por S3 em produção

## Funcionalidades principais

- **Dashboard** com resumo de pacientes, consultas futuras e auditoria
- **Pacientes**: tabela dinâmica, cadastro completo, anamnese assistida e repositório de documentos/imagens
- **Agenda**: calendário sincronizado com pacientes, status, lembretes configuráveis e controle de envio
- **Estoque**: abas para implantes CMI/HE/HI TAPA (com foto) e materiais odontológicos com ajuste rápido de quantidade
- **Documentos**: central única para receitas, prontuários, documentos pessoais e radiografias com filtros
- **Configurações**: modo claro/escuro, densidade de layout, animações e reset de preferências locais
- **API de saúde** (`/api/health`) para checagem pré-deploy

## Requisitos

- Node.js 18+
- pnpm (recomendado) ou npm
- Banco PostgreSQL com `DATABASE_URL`

## Configuração

1. Crie `.env.local` a partir de `.env.example`:
   ```env
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DB"
   NEXTAUTH_SECRET="gera_um_secret"
   NEXTAUTH_URL="http://localhost:3000"
   STORAGE_BASE_URL="/uploads"
   ```
2. Instale dependências:
   ```bash
   pnpm install
   ```
3. Gere cliente Prisma, rode migrações e popule o seed:
   ```bash
   pnpm prisma:generate
   pnpm prisma:migrate
   pnpm prisma:seed
   ```

Usuários iniciais:
- `admin@local` / `Admin!234`
- `medico@local` / `Medico!234`
- `recepcao@local` / `Recepcao!234`
- `david@clinica.com` / `3137221629`

## Execução

```bash
pnpm dev
```
Acesse em `http://localhost:3000`.

## Testes e verificações

- Lint: `pnpm lint`
- Unitários (Jest): `pnpm test`
- E2E (Playwright): `pnpm e2e`
- Verificação completa: `pnpm verify`
- Checagem rápida antes do deploy: `pnpm check`

## Deploy na Vercel

1. Crie projeto na Vercel apontando para este repositório.
2. Configure variáveis de ambiente `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `STORAGE_BASE_URL`.
3. Em *Build & Development Settings*, use `pnpm install`, `pnpm prisma:generate` e `pnpm prisma:deploy`.
4. Após o deploy, execute `pnpm prisma:seed` para dados iniciais (pode ser via `vercel env pull` + `vercel env push`).

### Checagem automática

- Endpoint `/api/health` retorna `{ status: "ok" }` para monitoramento ou smoke tests.
- Script `pnpm check` executa lint + testes unitários.

## Personalização de tema e cores

- Paleta principal definida em `app/globals.css` com variáveis CSS (`--background`, `--primary`, etc.).
- Ajuste as cores alterando os valores HSL nas seções `:root` e `.dark`.
- Componentes interativos usam `--interactive-height` para definir altura/padding. Alterar esse valor ajusta botões e inputs.
- A página **Configurações** (`/configuracoes`) permite controlar tema, densidade e animações sem editar código.

### Dicas de branding rápido

- Logotipo/sigla exibido na sidebar pode ser trocado em `components/layout/app-shell.tsx` (ícone "DD").
- Tipografia global configurada em `app/layout.tsx` com fonte Inter (Google Fonts).
- Para alterar gradientes de cabeçalhos, ajuste classes `bg-gradient-to-r` nas páginas em `app/(dashboard)/*`.

## Estrutura de diretórios

```
app/
  (auth)/        -> telas públicas (login, reset)
  (dashboard)/   -> páginas internas (dashboard, pacientes, agenda, estoque, documentos, configurações)
  api/           -> rotas serverless (pacientes, consultas, estoque, documentos, anamnese, upload, health)
components/
  estoque/       -> painéis de implantes e materiais
  pacientes/     -> tabela, anamnese e documentos
  layout/        -> AppShell e temas
lib/
  validations/   -> schemas Zod
  services/      -> lógicas auxiliares
prisma/
  schema.prisma  -> modelos e enums
  seed.ts        -> dados iniciais
```

## Onde alterar cores específicas

| Área                              | Arquivo                                      | O que editar                                   |
|----------------------------------|----------------------------------------------|------------------------------------------------|
| Paleta base (fundos, textos)     | `app/globals.css` (`:root` / `.dark`)        | Variáveis `--background`, `--foreground`, etc. |
| Gradientes de cabeçalhos         | `app/(dashboard)/*/page.tsx`                 | Classes `bg-gradient-to-*`                     |
| Sidebar / AppShell               | `components/layout/app-shell.tsx`            | Classes Tailwind (tons `emerald`, `cyan`)      |
| Botões padrão                    | `components/ui/button.tsx`                   | Variantes Tailwind                             |
| Altura de inputs/botões          | `--interactive-height` em `app/globals.css`  | Ajusta densidade global                        |

## Recursos adicionais

- Rotas protegidas via middleware (`middleware.ts`).
- Upload local salva em `public/uploads`; altere `STORAGE_BASE_URL` para CDN/S3 em produção.
- Auditoria registrada em `AuditLog` para ações sensíveis.

Bom trabalho e bons sorrisos com a plataforma Dr. David! 😁
