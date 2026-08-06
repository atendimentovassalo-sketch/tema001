# Estado do projeto — tema001 (SaaS de obituário para funerárias)

> Ponto de entrada para qualquer pessoa/IA. Diz **o que é**, **como está montado**, **o que está feito**,
> **o que falta** e **como foi feito**. Sem segredos (tokens/e-mails ficam no handoff interno).
> **Atualizado:** 06/08/2026 · **Estado:** 🟢 em produção, 1º cliente ativo.

## 1. Visão

SaaS multi-tenant: site institucional + obituário/memorial + painel. 1º cliente:
**Funerária São Francisco** (`funerariacatanduvas.com.br`). Demo: **`novomodelo.com.br`** (apex).

## 2. Arquitetura em produção (3 peças sob o mesmo domínio)

| # | Peça | Papel | Deploy |
|---|---|---|---|
| 1 | Pages `funerariacatanduvas` (direct upload) | site institucional estático (`/`, `/planos`, `/plantao`, `/cidade-*`, legais) | upload manual — **fora deste repo** |
| 2 | Pages `tema001` (**este repo**) | app React + API + assets + fotos | auto no push da `main` |
| 3 | Worker `proxy-obituario` | roteia rotas do app p/ tema001 e **reescreve `og:` por tenant** | editado no dashboard |

Rotas do Worker: `/obituario*` `/funeraria*` `/admin*` `/api/*` `/assets/*` `/memorial/*` `/m/*` `/aprovar/*` `/og-image.png*`.
Tudo fora disso cai no site estático (peça 1). **As peças 1 e 2 são deploys independentes.**

**Backend:** D1 `funeraria-db` + R2 `funeraria-fotos` (bindings `DB` e `PHOTOS` em Produção). Auth PBKDF2 100k + cookie. Resend p/ recuperação de senha.

## 3. Mapa do código

- `src/pages/memorial/` — HomeV2, Obituário, MemorialPage, AprovarHomenagem, NovoMemorial, `share.ts`.
- `src/pages/admin/` — Login, Painel, Configurações, Usuários, Recuperar.
- `functions/api/` — público: `memoriais`, `memoriais/:slug`, `homenagens`, `aprovar/:token`, `fotos/:key`;
  admin (protegido por `functions/api/admin/_middleware.ts`): `admin/memoriais` (CRUD+publicar),
  `admin/homenagens/*`, `admin/fotos`, `admin/config`, usuários; auth: `auth/recuperar`, `auth/definir-senha`.
- `functions/_lib/` — email (Resend), helpers. `migrations/` — schema + `seed.sql`.

## 4. Feito ✅ (em produção, verificado)

- Backend completo (Fases 0–7): memoriais, homenagens+moderação, fotos R2, config, usuários, sessões.
- Auth própria + **recuperação de senha por e-mail** (Resend) funcionando.
- Compartilhamento por nota (WhatsApp) + chama de vela + locais padrão + template de WhatsApp editável.
- **Go-live 01/08** e 1ª venda; 1º cliente (São Francisco) no D1 de produção.
- Entrega à Jessica 04/08: dados de teste limpos, **1ª nota real publicada** (Amalia Teresa Justen); R2 exercitado em prod.
- **Correção da marca no Worker** (04/08): era "Funerária Demonstração" + `og:image` de terceiro (Skip) →
  agora marca São Francisco por tenant, com **prévia individual por nota** usando a foto do falecido.

## 5. Pendências / próximos passos

- **Multi-tenant operacional (próxima frente):** onboarding sem SQL, provisionamento por domínio,
  `og-image` por tenant (hoje o banner é único no Worker), UI de gestão de tenant/usuários.
  Decisão **fechada** (05/08): Modelo A (D1 único + isolamento lógico + backup por tenant) e site institucional
  **separado** por cliente. Dossiê/plano/briefs em `PROJETOS - CLAUDE/SAAS-FUNERARIAS/`.
  - ✅ **Fase 0 (resolução por host) — FEITA E NO AR (05/08):** coluna `tenant.dominio` (migration
    `0003_dominio.sql` aplicada local+remoto), `getTenantPorHost()` em `_lib/db.ts` (lê `X-Forwarded-Host`
    que o Worker já repassa), 3 chamadores públicos trocados. Deploy `c9e09b8` Active. Verificado ao vivo:
    `funerariacatanduvas.com.br`→São Francisco (Amalia), `funeraria.novomodelo.com.br`→Funerária Modelo.
    SF intacta. Fallback single-tenant não vaza com 2+ tenants.
  - ✅ **Cliente 02 criado (Funerária Modelo, tenant `t-modelo`):** DEMO/vendas, cidade "Cidade", WhatsApp do
    vendedor `5545920033029` + `whatsapp_template` de vendas, com memorial de exemplo
    (`exemplo-memorial`, Maria Aparecida Ribeiro).
  - ✅ **Fiação do `novomodelo.com.br` — FEITA E NO AR (06/08):** o modelo passou do subdomínio para o **apex**,
    no mesmo padrão da São Francisco. `tenant.dominio` de `t-modelo` = `novomodelo.com.br`. Pages
    `funeraria-modelo` virou custom domain do apex (CNAME `@`); as 9 rotas do app foram criadas no
    `proxy-obituario` para `novomodelo.com.br`; `funeraria.novomodelo.com.br` foi **decomissionado**
    (custom domain e CNAME removidos) e o Pages `tema001` ficou **sem custom domains**. Registros de e-mail
    (MX/SPF/DKIM/DMARC do Resend) intactos. Verificado ao vivo: raiz = site estático do modelo,
    `/funeraria` e `/api/memoriais` = Funerária Modelo, São Francisco intacta.
    Brief: `SAAS-FUNERARIAS/BRIEF-EXECUCAO-fiacao-novomodelo.md`.
  - ⏳ **Pendências do modelo:** (a) preview WhatsApp/`og:` de `novomodelo.com.br` ainda diz "Demonstração"
    (host não está no mapa `TENANTS` do Worker — resolver na Fase 1 ou add manual);
    (b) ⚠️ **mudança de destino do domínio:** o `novomodelo.com.br` passará a ser **portfólio multi-nicho**
    (sites + GBP de funerárias, advogados, psiquiatras, chaveiros, oficinas, despachantes…), com meta de
    ranquear para "site para \<nicho\>" / "modelos de site". Isso conflita com a raiz servir hoje a home de
    **uma** funerária-modelo, e as rotas do app no apex (`/assets/*`, `/api/*`, `/admin*`) passam a ocupar
    caminhos que um site de portfólio normalmente usa. Decidir a arquitetura antes de produzir conteúdo.
- **Shell `index.html`** ainda tem o texto do template ("Demonstração") — a marca certa vem do Worker;
  corrigir aqui como cinto-e-suspensório na próxima vez que o repo for tocado.
- Bindings do ambiente **Preview** não configurados (só Produção). Revisão jurídica das páginas legais.
- **🌐 Próxima frente de DEV — guarda-chuva `obituario.com.br` (decidido 06/08):** cada obituário é publicado
  1 vez no app e servido em 2 hosts — o **domínio próprio da funerária** (site completo entregue a ela) **e**
  **`obituario.com.br`** (do Felipe), com o `obituario.com.br` como **canônico** (indexa/ranqueia). Rotas novas:
  `obituario.com.br/<cidade>` (índice **cross-tenant** por cidade, marca por nota) e `/<cidade>/<slug>` (nota
  canônica). Nas páginas de obituário do domínio da funerária, `rel=canonical` → obituario.com.br (evita
  conteúdo duplicado). Isso ranqueia o guarda-chuva e é o moat da assinatura. Também pendente: **link de
  moderação/consentimento da família** (estende `aprovar_token`, ver Decisão 06). Arquitetura completa:
  `PROJETOS - CLAUDE/SAAS-FUNERARIAS/ARQUITETURA-obituario-umbrella.md`. Design da página de obituário +
  esse dev = próxima conversa do Felipe.

## 6. Como foi feito (histórico)

polish do relatório Wedy → backend Fases 0–7 → go-live+venda (01/08) → Resend (03/08) → entrega+limpeza (04/08)
→ fix da marca no Worker via HTMLRewriter (04/08). Gotchas de produção resolvidos: PBKDF2 limitado a 100k no
Workers (erro 1101); `virtualStoreDir` no `pnpm-workspace.yaml` quebrava o build (removido); typo "Funeária"
no nome do tenant (era dado dinâmico no D1, não hardcode).

## 7. Reverter / operar

- App: `main` → deploy automático. Reverter = Cloudflare Pages `tema001` → Implantações.
- Worker: Cloudflare → Workers → `proxy-obituario` → Implantações (versão anterior `751ea4c3`).
- Gestão de usuários/tenant: via SQL no D1 (não há UI). **Só um tenant real** — não testar operação destrutiva nele.

## 8. Documentação relacionada (fora do repo)

Handoff interno do cliente, dossiês técnicos (redeploy, marca no Worker) e o mapa mestre da entrega ficam em
`PROJETOS - CLAUDE/FUNERARIA SAO FRANCISCO/` e no vault Obsidian ("Obsidian - Claude" → Clientes/Projetos).
