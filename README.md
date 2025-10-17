# Controle Pessoal — by David

Dashboard integrado para controle financeiro e de saúde construido com Next.js 14, Tailwind, Prisma e NextAuth.

## Requisitos
- Node.js 18+
- npm ou pnpm
- Banco de dados SQLite (dev) / Postgres (prod)

## Instalação
```bash
npm install
```

## Variáveis de ambiente
Crie um arquivo `.env` com os valores abaixo:
```env
DATABASE_PROVIDER="sqlite"
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="changeme"
NEXTAUTH_URL="http://localhost:3000"
```

Para produção com Postgres defina:
```env
DATABASE_PROVIDER="postgresql"
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DB"
```

## Scripts
- `npm run dev` — modo desenvolvimento
- `npm run build` — build de produção
- `npm run start` — inicia o servidor
- `npm run seed` — popula o banco com dados exemplo
- `npm run test` — testes unitários / componentes (Vitest)
- `npm run test:e2e` — testes end-to-end (Playwright)

## Banco de dados
```bash
npx prisma generate
npx prisma migrate dev
npm run seed
```

## Uploads
Arquivos de exames e exportações são gravados em `uploads/` (local). Configure `STORAGE_STRATEGY` conforme necessário para produção.

## Login padrão
Após `npm run seed`, autentique com `david@example.com` / `senha123`.
