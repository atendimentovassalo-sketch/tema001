# Go-live — colocar o SaaS de funerária no ar (1ª cliente)

Este é o passo a passo para provisionar a infraestrutura real na Cloudflare e
publicar. Até aqui **tudo rodou local** (miniflare), sem tocar a conta. Os passos
abaixo criam recursos reais e fazem o deploy.

> Conta Cloudflare do projeto: `Atendimento.vassalo@gmail.com` · Pages `tema001`
> (repo `atendimentovassalo-sketch/tema001`). A branch de trabalho é `feat/backend`.

---

## 0. Pré-requisitos
- `wrangler login` (autenticar a conta Cloudflare).
- Estar na pasta do projeto, branch `feat/backend`.

## 1. Criar o banco D1
```bash
npx wrangler d1 create funeraria-db
```
Copie o `database_id` retornado e cole em `wrangler.toml` (campo `database_id`,
hoje com zeros). Faça o mesmo binding no **painel do Pages** (passo 5).

## 2. Criar o bucket R2 (fotos)
```bash
npx wrangler r2 bucket create funeraria-fotos
```

## 3. Aplicar o schema no D1 remoto
```bash
npx wrangler d1 migrations apply funeraria-db --remote
```

## 4. Cadastrar a 1ª funerária (tenant) + admin
Edite um arquivo `migrations/seed-cliente.sql` com os dados **reais** da cliente
(NÃO use o seed de demonstração em produção) — tenant + usuário admin com um
`convite_token` aleatório. Gere o token:
```bash
node -e "console.log(crypto.randomUUID()+crypto.randomUUID())"
```
Exemplo de conteúdo:
```sql
INSERT INTO tenant (id, slug, nome, cidade, uf, telefone, whatsapp, endereco, desde, sobre, cor_marca)
VALUES ('t1','<slug>','<Nome da Funerária>','<Cidade>','<UF>','<telefone>','<whatsapp>','<endereço>','<ano>','<sobre>','#B5623F');

INSERT INTO usuario (id, tenant_id, nome, email, papel, ativo, convite_token, convite_expira)
VALUES ('u1','t1','<Nome do responsável>','<email>','admin',1,'<TOKEN_ALEATORIO>', datetime('now','+7 days'));
```
Aplique no remoto:
```bash
npx wrangler d1 execute funeraria-db --remote --file migrations/seed-cliente.sql
```
Entregue à cliente o link de 1º acesso: `https://<dominio>/admin/login?convite=<TOKEN>`
(ela define a própria senha — nós nunca a digitamos).

## 5. Ligar os bindings no Pages
No painel: **Workers & Pages → tema001 → Settings → Functions**:
- **D1 database bindings:** variável `DB` → banco `funeraria-db`.
- **R2 bucket bindings:** variável `PHOTOS` → bucket `funeraria-fotos`.
- **Compatibility date:** `2026-08-01`.
(Isso vale para o deploy automático via Git; o `wrangler.toml` cobre o dev local.)

## 6. Preencher as páginas legais
Em `src/pages/legal/Privacidade.tsx` e `Termos.tsx`, substituir os campos
destacados (razão social, CNPJ, endereço, e-mail do DPO, comarca). **Revisar com
advogado** antes de publicar.

## 7. Publicar
Fazer o merge de `feat/backend` → `main` (a `main` faz deploy automático no
Pages, que detecta a pasta `functions/` sozinho). Acompanhar o build no painel.

## 8. Verificação pós-deploy (checklist)
- [ ] `https://<dominio>/funeraria` abre e lista o obituário (vazio no início).
- [ ] 1º acesso pelo link de convite define a senha e entra no painel.
- [ ] Criar memorial → "Salvar e publicar" → aparece em `/funeraria` e `/obituario`.
- [ ] Página do memorial abre em `/m/<slug>`; acender vela funciona.
- [ ] Se moderar mensagens: mensagem entra como pendente e some da fila ao aprovar.
- [ ] Upload de foto aparece na página (servida por `/api/fotos/...`).
- [ ] Console do navegador **sem violações de CSP** (fontes/imagens carregam). Se
      algo for bloqueado, ajustar `public/_headers`.
- [ ] HTTPS válido (cadeado) e sem conteúdo misto.
- [ ] `/privacidade` e `/termos` com os dados preenchidos.

## 9. Segurança e LGPD já embutidos
- Senhas com PBKDF2-SHA256; sessão por cookie httpOnly.
- Rate-limit por IP (hash, sem IP cru) nas homenagens; honeypot anti-spam.
- Apagar um memorial remove também as fotos do R2 (direito à exclusão).
- Headers de segurança em `public/_headers` (CSP, HSTS, X-Frame-Options…).

## 10. Backup do D1 (rotina)
```bash
npx wrangler d1 export funeraria-db --remote --output backup-$(data).sql
```

---

### Fora do MVP (fases pós-venda)
Cobrança/assinatura in-app, cadastro self-service de várias funerárias, e envio
automático do link de aprovação por WhatsApp (hoje a moderação é feita no painel).
