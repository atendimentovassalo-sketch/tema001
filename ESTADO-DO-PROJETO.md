# Estado do projeto — tema001 (SaaS de obituário para funerárias)

> Ponto de entrada para qualquer pessoa/IA. Diz **o que é**, **como está montado**, **o que está feito**,
> **o que falta** e **como foi feito**. Sem segredos (tokens/e-mails ficam no handoff interno).
> **Atualizado:** 05/08/2026 · **Estado:** 🟢 em produção, 1º cliente ativo.

## 1. Visão

SaaS multi-tenant: site institucional + obituário/memorial + painel. 1º cliente:
**Funerária São Francisco** (`funerariacatanduvas.com.br`). Demo: `funeraria.novomodelo.com.br`.

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
  Decisão em aberto: site institucional **dentro** do SaaS ou **separado** (como a São Francisco).
- **Shell `index.html`** ainda tem o texto do template ("Demonstração") — a marca certa vem do Worker;
  corrigir aqui como cinto-e-suspensório na próxima vez que o repo for tocado.
- Bindings do ambiente **Preview** não configurados (só Produção). Revisão jurídica das páginas legais.

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
