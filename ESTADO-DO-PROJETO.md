# Estado do projeto — tema001 (SaaS de obituário para funerárias)

> Ponto de entrada para qualquer pessoa/IA. Diz **o que é**, **como está montado**, **o que está feito**,
> **o que falta** e **como foi feito**. Sem segredos (tokens/e-mails ficam no handoff interno).
> **Atualizado:** 06/08/2026 (correções pontuais em 13/08 e 14/08 — ver avisos abaixo) · **Estado:** 🟢 em produção, 1º cliente ativo · guarda-chuva `obituario.com.br` nas fases U0–U1.

> ⚠️ **Aviso de 13/08/2026 — este documento não foi reescrito, só corrigido em 4 pontos. Fonte de
> verdade real é `SAAS-FUNERARIAS/DECISOES.md`.**
> 1. **Domínio do guarda-chuva:** o `obituario.com.br` de terceiro descrito abaixo (D12, §5) **não é
>    mais o plano**. Fechado em 11/08: o domínio é `obitos.com.br` (produto "Óbitos"), registrado
>    07/08/2026 — a espera pelo drop foi encerrada. `obtuario.com.br` segue só como redirect
>    defensivo, nunca marca. A regra de não chumbar domínio no código continua valendo.
> 2. **Modelo de publicação:** o "Modelo B" descrito no §5 (obituário só no guarda-chuva, sem espelho
>    no domínio da funerária) foi **substituído pelo Modelo A em 11/08** — espelho no domínio da
>    funerária + `rel=canonical` para o guarda-chuva. Todo o §5 abaixo descreve a arquitetura antiga;
>    tratar como histórico até este documento ser reescrito por inteiro.
> 3. **"Modelo A" é ambíguo neste próprio arquivo:** onde §5 diz "Modelo A (D1 único + isolamento
>    lógico...)" (decisão de 05/08), leia **"D1 único com isolamento lógico"** — desde 11/08 o rótulo
>    "Modelo A" pertence ao modelo de publicação do item 2 acima, não ao isolamento do banco.
> 4. **Segurança (13/08):** `functions/_lib/db.ts`, `getMemorialPublico` não filtrava
>    `status = 'publicado'` — um memorial em rascunho era servido por `GET /api/memoriais/:slug` para
>    quem soubesse o slug. Corrigido localmente em 13/08 (uma linha, único chamador verificado:
>    `functions/api/memoriais/[slug].ts`) — **ainda não commitado nem enviado (push)**, confirmar
>    antes de assumir que já está em produção.

> ⚠️ **Aviso de 14/08/2026 — sessão de ferramental (skill + higiene de repo), sem mexer em produção:**
> 1. **Nova skill `verifica-memorial`** adicionada ao repo em `.claude/skills/verifica-memorial/`
>    (`SKILL.md` + `verifica_memorial.py`). Confere uma página de memorial contra o
>    `SAAS-FUNERARIAS/DECISOES.md` antes de publicar (reporta BLOQUEIA / CORRIGE / AVISA por arquivo:linha).
>    **Commitada e enviada:** `umbrella-u1` = `1be4f15`, em sincronia com `origin`. Checker testado contra
>    `memorial-v5.html` → `0 BLOQUEIA · 4 CORRIGE · 1 AVISA · PUBLICA`. Roda em Python 3 puro (sem
>    dependências); no Windows usar `python`, não `python3`.
> 2. **Inconsistência de fim de linha (CRLF) entre ambientes — diagnosticada, não é emergência.** O repo tem
>    134 arquivos idênticos exceto pelo fim de linha (disco CRLF vs. índice LF) e **não tem `.gitattributes`**.
>    No **Git for Windows** (esta máquina, Claude Code) `core.autocrlf=true` no nível system → `git status`
>    mostra ~1 arquivo e `git add -A` **é seguro** (normaliza no stage). No **git do lado Linux** (sessões de
>    nuvem/device_bash) o autocrlf não está setado → `git status` mostra 135 e `git add -A` **commitaria os
>    134 em churn**, disparando deploy do Pages sobre nada. **Regra prática:** enquanto não houver
>    `.gitattributes`, git nesse repo só pelo Claude Code (Windows); em sessão Linux, escopo travado
>    (`git add <caminho>`, nunca `-A`/`.`). Correção definitiva escrita, **não executada**, em
>    `SAAS-FUNERARIAS/PROCEDIMENTO-normalizar-CRLF.md` (rodar só em janela sem deploy; lista de binários já
>    auditada em 14/08 — só `.png` e `.ico` versionados, ambos cobertos).
> 3. **`ESTADO-DO-PROJETO.md` (este arquivo)** segue modificado e **fora** do commit `1be4f15` — o commit
>    entrou só com a skill, de propósito, para não arrastar a churn. Decidir separadamente quando/como commitar
>    este arquivo (idealmente pelo Windows, ou depois da normalização).

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
- **Skill `verifica-memorial` no repo** (14/08, commit `1be4f15`): gate de conferência de página de memorial
  contra o `DECISOES.md` antes de publicar (ver aviso de 14/08 no topo).

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
- **🌐 Próxima frente de DEV — guarda-chuva `obituario.com.br` (Modelo B, decidido 06/08):** o obituário **vive
  só no `obituario.com.br`**, white-label com a marca da funerária que informou (não espelha no domínio da
  funerária). Rotas novas: `obituario.com.br/<cidade>` (índice **cross-tenant** neutro, com card da funerária
  por nota) e `/<cidade>/<slug>` (nota individual, branding pela funerária **dona da nota** — não pelo host).
  O site próprio da funerária (domínio à parte) linka "Obituários" → obituario.com.br. **Por que B:** o link do
  WhatsApp aponta pro `obituario.com.br` → concentra todo o tráfego no domínio → é o que ranqueia (o moat). O
  "espelho + canonical" (Modelo A) fica como premium do tier exclusivo. Arquitetura completa:
  `SAAS-FUNERARIAS/ARQUITETURA-obituario-umbrella.md`; design + plano de execução fechados em
  `SAAS-FUNERARIAS/PROPOSTA-umbrella-v5.md` (12 decisões, fases U0–U8).
  - 🚨 **DOMÍNIO NÃO DEFINIDO (D12) — não chumbar nome nenhum:** `obituario.com.br` (grafia certa) é de
    **terceiro** (registrado há 10 anos, estacionado, vence 23/10/2026). Pelo registro.br o vencimento
    congela o domínio por ~104 dias com o dono podendo renovar; a liberação é por **candidatura com
    leilão** quando há 2+ interessados — quase certo num domínio de palavra-chave. Cenário otimista de
    liberação: **fev/2027**, disputado. `obtuario.com.br` (sem o "i") é grafia ERRADA → só redirect
    defensivo, NUNCA a marca. **Plano B: marca própria** (não precisa conter "obituário" — ranqueia por
    conteúdo, como o Legacy.com). No código: `Env.UMBRELLA_DOMAIN` e `Env.UMBRELLA_NOME`; front usa
    `window.location.origin`; rota com request usa o host da requisição. O histórico acumula no D1, que é
    agnóstico de domínio. **O portão real não é "antes do dev" — é antes de publicar a 1ª nota real no
    guarda-chuva**, porque link já circulado no WhatsApp não tem redirect se o domínio antigo não for
    nosso. Desenvolver U2–U6 em subdomínio de teste **com `noindex`**.
  - ✅ **U0 (cidade + marca no banco) — FEITA E APLICADA EM PRODUÇÃO (06/08):** migrations `0004_cidade.sql`
    (tabela `cidade` + `memorial.cidade_id` + `tenant.cidade_id` + índice `idx_memorial_indice`),
    `0005_marca.sql` (`tenant.logo_url`, `tenant.site_url`) e `0006_backfill_cidade.sql`. Só aditivas —
    nenhum dado alterado ou removido; contagens conferidas antes/depois (2 tenants, 2 memoriais,
    4 homenagens, 2 eventos, 3 usuários; nome da SF intacto). Catanduvas/PR criada com slug
    **`catanduvas-pr`** — regra fechada: slug de cidade é SEMPRE `<cidade>-<uf>`, porque há homônimas entre
    estados (existe Catanduvas no PR e em SC) e slug de cidade vira URL permanente. Nota real da SF
    (Amalia) vinculada; `t-modelo` ficou com `cidade_id` NULL de propósito (é demo, cidade "Cidade"/"UF" —
    criaria a URL lixo `/cidade`, e nota sem cidade nunca entra em índice).
    - ⚠️ **Achado que validou a decisão da chave de cidade:** a única nota real tem
      `cidade_falecimento = "Cascavel"` (polo hospitalar) sendo de Catanduvas. Usar esse campo como chave
      do índice mandaria **2 de 2 notas** para a cidade errada. A cidade do índice é a da **funerária que
      publicou**, sempre — preenchida automaticamente, sem campo editável na v1.
  - ✅ **U1 (APIs cross-tenant) — FEITA no código (06/08), ainda NÃO exposta ao público:**
    `functions/_lib/umbrella.ts` (novo) + rotas `api/publico/cidades`, `api/publico/<cidade>`,
    `api/publico/<cidade>/<slug>` e `api/publico/homenagens`. Resolvem o tenant **pela nota**, não pelo
    host — corrige o achado de que `getTenantPorHost` devolve `null` no `obituario.com.br` (com 2+ tenants
    e host desconhecido), o que faria a nota não carregar e a homenagem não gravar. `db.ts` só ganhou
    `export` em 4 helpers e `logoUrl`/`siteUrl` no DTO; **nenhuma rota antiga mudou de comportamento**.
    Verificado: `tsc --noEmit` nas 31 Functions sem erro, e ensaio SQL com **duas funerárias na mesma
    cidade** (`migrations/testar_u1.py`) — rascunho não vaza, velório não confirmado não vira selo, e o
    slug da nota não colide com o do tenant no `JOIN t.*`.
  - ⏳ **Próximo: U2** — rotas `/`, `/<cidade>`, `/<cidade>/<slug>` no app + Worker do `obituario.com.br`
    com lista de prefixos reservados. Atenção: `/<cidade>` é catch-all de um segmento e engoliria `/api`,
    `/assets`, `/admin`; slug de cidade desconhecido tem que devolver **404 real**, senão o domínio gera
    URLs infinitas e é rebaixado na busca. Depois: U3 og/sitemap/schema, U4 logo, U5 link da família,
    U6 fotos de familiares, U7 aviso por e-mail (Worker + cron, nunca no `proxy-obituario`), U8 métrica.
  - 🔒 **Portão jurídico antes de U5/U6:** termo revisado por advogado (§3.6 da proposta). Inclui o ponto
    novo de que foto enviada por terceiro pode conter **outras pessoas vivas** — direito de imagem de
    titular vivo, que o termo atual não cobre.

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
