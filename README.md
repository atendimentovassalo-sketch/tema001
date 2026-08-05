# tema001 — SaaS de obituário/memorial para funerárias

Aplicação multi-tenant que dá a uma funerária um **site institucional + obituário online + painel de
gestão**. Primeiro cliente em produção: **Funerária São Francisco** (`funerariacatanduvas.com.br`).
Demo público: `funeraria.novomodelo.com.br`.

> **👉 Estado do projeto, o que está feito e o que falta:** ver **[`ESTADO-DO-PROJETO.md`](ESTADO-DO-PROJETO.md)**.
> Esse é o ponto de entrada para qualquer pessoa (ou IA) que chegar ao repo. Leia antes de mexer.

## O que faz

- **Obituário / memorial:** a funerária publica notas de falecimento (foto, história, locais e horários de
  velório/sepultamento); famílias deixam **homenagens** que a funerária **modera** antes de publicar.
- **Painel admin:** CRUD de memoriais, moderação, upload de fotos, configurações, gestão de usuários.
- **Compartilhamento:** cada nota gera mensagem pronta de WhatsApp; prévia de link com a marca da funerária.
- **Multi-tenant:** `tenant_id` em todo o schema; a API resolve a funerária pelo domínio.

## Stack

- **Front:** React + Vite + TypeScript + Shadcn UI + Tailwind + React Router (template "Skip").
- **Back:** Cloudflare **Pages Functions** (`functions/api/*`) + **D1** (SQLite) + **R2** (fotos).
- **Auth:** própria — PBKDF2-SHA256 (**100k** iterações, limite do Workers) + sessão cookie httpOnly.
- **E-mail:** Resend (recuperação de senha).
- **Deploy:** Cloudflare Pages, deploy automático no push da branch `main`.

## Arquitetura em produção (importante)

O domínio do cliente (`funerariacatanduvas.com.br`) é servido por **3 peças**, não uma:

1. **Pages `funerariacatanduvas`** (direct upload) — o **site institucional estático** (fora deste repo).
2. **Pages `tema001`** (este repo) — o app React + API, publicado em `tema001.pages.dev`.
3. **Worker `proxy-obituario`** — roteia as rotas do app (`/obituario`, `/admin`, `/api/*`, `/assets/*`,
   `/memorial/*`, `/og-image.png*`…) para o `tema001.pages.dev` **e reescreve as meta tags `og:` por tenant**
   (marca correta na prévia de compartilhamento). O shell `index.html` deste repo ainda traz o texto do
   template — a marca certa em produção vem do Worker.

Detalhes completos e mapa de estado em [`ESTADO-DO-PROJETO.md`](ESTADO-DO-PROJETO.md).

## Rodar localmente (Windows — atenção aos gotchas)

`pnpm dev` / `npm run dev` **quebram** neste ambiente (o `pnpm-workspace.yaml` tem artefatos de hospedagem).
Rode o Vite e o Wrangler direto:

```bash
corepack pnpm install
# front (porta 8080):
node node_modules/vite/bin/vite.js
# API + D1 + R2 local (porta 8788):
node node_modules/wrangler/bin/wrangler.js pages dev dist --port 8788 --local
```

- Só **uma** instância do Wrangler por porta. Migrations: `wrangler d1 migrations apply funeraria-db --local`;
  seed: `--file migrations/seed.sql`.
- ⚠️ **NÃO** commitar mudança no `pnpm-workspace.yaml` (a linha `virtualStoreDir: ${...:-/app}/...` quebra o
  build da Cloudflare — deve ficar removida; ver histórico do go-live).

## Deploy

Push na `main` → build+deploy automático no Pages (`tema001.pages.dev`). Fixes de produção vão direto na
`main`. Após o deploy, abas já abertas podem precisar de **Ctrl+Shift+R**.

## Convenções

- Existe **apenas UM tenant real** (o cliente). Não rodar `PUT /api/admin/config` nele em teste (sobrescreve
  dados reais). Usar tenant/admin descartável para testes destrutivos.
- Segredos (tokens de convite, e-mails de admin, chaves) **não** vivem neste repo — ficam no handoff interno.
