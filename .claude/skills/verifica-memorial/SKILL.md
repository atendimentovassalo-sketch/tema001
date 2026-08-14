---
name: verifica-memorial
description: >-
  Confere uma página de memorial do produto Óbitos contra as decisões fechadas
  do SAAS-FUNERARIAS/DECISOES.md antes de ela ir ao ar. Use SEMPRE que alguém
  (você ou outra sessão) criar, reconstruir, redesenhar ou editar uma página de
  memorial/nota de falecimento, ao comparar duas versões de memorial, e como
  último passo antes de qualquer publicação ou deploy que toque essa página.
  Dispare também quando o pedido for "refaz o memorial", "melhora a página do
  falecido", "compara essas duas versões" ou "pode publicar?". Reporta com
  arquivo e linha, separando o que BLOQUEIA (contraria decisão fechada), o que
  CORRIGE (bug/acessibilidade já registrados) e o que AVISA (item EM ABERTO —
  decisão do Felipe, nunca da sessão).
allowed-tools: [Read, Grep, Glob, Bash, Edit]
---

# verifica-memorial — o portão da página de memorial

Esta skill existe por causa de um erro real: em 13/08/2026 uma sessão sem acesso
ao vault reconstruiu o memorial a partir da página em produção e reintroduziu o
que a despoluição da v5 tinha removido de propósito. A auditoria fechou em **11
colisões diretas** — todas detectáveis por regra. Aqui elas viraram regra.

**O que esta skill NÃO faz:** não decide linha visual, não escolhe paleta, não
reescreve conteúdo de luto. Ela confere e reporta. Decisão continua sendo do
Felipe.

## Procedimento

1. **Ler.** Abrir a página candidata e a referência canônica
   (`FUNERARIA SAO FRANCISCO/memorial-v5.html` — e `memorial-v5-aviso.html`
   para o estado de hora zero). Nunca partir da página em produção: foi
   exatamente esse o erro de 13/08.
2. **Confirmar.** Rodar o conferidor determinístico:

   ```bash
   python3 .claude/skills/verifica-memorial/verifica_memorial.py \
       <pagina.html> --referencia "<caminho>/memorial-v5.html"
   ```

   Sem dependências externas. Código de saída 1 quando há bloqueio.
3. **Reportar com o local.** Repassar cada achado com arquivo e linha, na ordem
   BLOQUEIA → CORRIGE → AVISA. Nunca dizer "achei alguns problemas": dizer qual,
   onde, e qual decisão ele contraria.
4. **Corrigir.** BLOQUEIA e CORRIGE podem ser corrigidos direto — são decisão
   fechada e bug registrado, não escolha. **AVISA nunca**: é item EM ABERTO,
   volta para o Felipe com as opções.

**Regra de saída:** havendo 1 BLOQUEIA, a página não publica. Sem exceção
"é só um detalhe" — os 11 itens de 13/08 eram todos detalhes.

## O que cada nível significa

| Nível | O que é | Quem resolve |
|---|---|---|
| **BLOQUEIA** | Contraria decisão fechada (despoluição, só-ano no nascimento, visitas fora da página, dois modos, vela independente, canonical/og:) | A sessão corrige e reporta |
| **CORRIGE** | Bug ou acessibilidade já registrados em EM ABERTO — correção, não escolha de linha | A sessão corrige e reporta |
| **AVISA** | Toca item EM ABERTO (paleta, Newsreader, ordem não comparável) | **Só o Felipe** |

## O que o conferidor cobre

Despoluição (telefone só no rodapé · sem nav de navegação · sem barra utilitária
acima do cabeçalho · sem subtítulo no cabeçalho · sem "Outras despedidas" · sem
breadcrumb visível · sem o par fixo Ligar+WhatsApp) · dados do falecido (só-ano
no nascimento na tela e no `birthDate` do JSON-LD) · contador de visitas fora da
página pública · contador zerado · dois modos por `fim_servicos` · vela como
formulário independente · `og:` e `canonical` para `obitos.com.br` · handler
órfão que quebra o script · skip-link, `aria-live`, `<label for>` · paleta e
fonte fora do que está decidido · ordem das seções contra a referência.

## O que ele NÃO cobre — confira no olho

Isto está aqui para você não confundir "passou" com "conferido":

- **Moderação prévia realmente ativa** (o texto declarar não prova que a rota
  modera). Conferir no backend.
- **Galeria não renderizada quando não há foto** — depende de execução, não do
  HTML estático.
- **Ocultar ≠ apagar** (`status=oculta`, nunca DELETE) — é regra de API.
- **Veracidade do conteúdo**: nome, data de falecimento, horário e local do
  velório. Isso é o gate do dossiê 170, contra o cadastro — não é esta skill.
- **Ordem das seções** quando os `id` não coincidem com a referência: o
  conferidor avisa que não conseguiu comparar em vez de fingir que passou.

## Gotchas

- **A referência é a v5, não a produção.** `memorial-v3.html` e
  `memorial-v3_1.html` são históricos; `memorial-v3_1` é referência *visual* de
  mural, nunca página-modelo.
- **A v5 tem bug conhecido.** O handler órfão `#compartilhar`
  (`memorial-v5.html` L584 / `memorial-v5-aviso.html` L548) faz o conferidor
  apontar CORRIGE na própria referência. É esperado e está registrado em EM
  ABERTO — não é falha do conferidor.
- **Comentário não é conteúdo.** O conferidor apaga comentários HTML antes de
  checar (preservando o número da linha), porque a v5 explica em comentário por
  que o contador de visitas não existe.
- **Regra nova só entra se for determinística.** Se depender de julgamento
  ("ficou bonito", "está claro"), não vira regra — vira pergunta ao Felipe.
- **Quando um BLOQUEIA parecer errado, o candidato a estar errado é a regra.**
  Antes de afrouxar, conferir a decisão no `SAAS-FUNERARIAS/DECISOES.md`; se a
  decisão mudou, a regra muda junto e a mudança é registrada.

## Eval (rodar depois de mexer no conferidor)

| Página | Resultado esperado |
|---|---|
| `memorial-v5.html` | **0 BLOQUEIA** · 4 CORRIGE (3 de acessibilidade + handler órfão L584) · 1 AVISA |
| `memorial-v5-aviso.html` | **0 BLOQUEIA** · 4 CORRIGE (handler órfão L548) · 1 AVISA |
| `_comparar-2026-08-13/13-08-memorial.html` | **13 BLOQUEIA** (barra utilitária L914, nav L920, telefone L914/926/1387, datas L942/1310, visitas L1079, vela L1202, birthDate L1581, Ligar+WhatsApp L1388, sem `fim_servicos`, canonical fora do guarda-chuva) · 2 AVISA |

Se a v5 passar a acusar BLOQUEIA, a regra quebrou — não a página.

## Fontes

`SAAS-FUNERARIAS/DECISOES.md` (autoridade) · `SAAS-FUNERARIAS/DOSSIE-memorial-v5.md`
(§2 despoluição, §3 rodapé, §7 decisões, §8 hora zero) ·
`SAAS-FUNERARIAS/AUDITORIA-COLISAO-13-08.md` (§2 par 1, as 11 colisões) ·
dossiês [182] (loops de verificação viram skills), [170] (verificação > fluência),
[172] (grade rastreável) em `SKILLS/claudio/references/dossies-saas-obitos.md`.
