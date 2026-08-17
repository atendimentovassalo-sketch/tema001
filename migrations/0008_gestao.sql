-- Módulo de gestão: clientes + financeiro (17/08/2026).
--
-- ORIGEM: pedido da Jéssica (Funerária São Francisco), autorizado pelo Felipe
-- com fronteira explícita — "sistema simples, nada relacionado a notas fiscais e
-- outras complicações. Só controle de clientes e financeiro". Registro completo
-- em SAAS-FUNERARIAS/DECISOES.md, 17/08/2026.
--
-- O QUE ESTÁ FORA, POR DECISÃO (não por esquecimento):
--   - nota fiscal, NF-e/NFS-e, regime tributário, cadastro fiscal de produto;
--   - estoque (a cliente pediu, o Felipe não autorizou nesta rodada);
--   - contas a pagar recorrentes, conciliação bancária, centro de custo.
-- Qualquer um desses volta como decisão nova, nunca como subentendido.
--
-- DIMENSIONAMENTO REAL (questionário respondido em 13/08): ~30 famílias com
-- plano, mensalidade de R$ 65 a R$ 100, e de 0 a 10 atendimentos por mês a um
-- ticket de ~R$ 6.000. É uma operação de dezenas de linhas por mês, não de
-- milhares — o desenho abaixo é deliberadamente pequeno.
--
-- DECISÕES DESTE ESQUEMA:
--
-- 1. DINHEIRO EM CENTAVOS, INTEIRO. Nunca REAL/float: 0.1 + 0.2 não dá 0.3 em
--    binário, e num controle financeiro isso vira centavo perdido que ninguém
--    acha depois. A formatação para "R$ 97,00" é problema da tela.
--
-- 2. O PLANO MORA DENTRO DE `cliente`, não em tabela própria. Uma família tem um
--    plano; a operação toda tem ~30. Tabela separada só se paga quando a mesma
--    família assina mais de um, o que não é o caso hoje. Se um dia for, virar
--    tabela é migration, não redesenho.
--
-- 3. `lancamento` NÃO tem status como texto livre. O estado é derivado:
--    `pago_em IS NULL` = em aberto; preenchido = pago. Um campo a menos para
--    ficar inconsistente com a realidade.
--
-- 4. COMPETÊNCIA É 'AAAA-MM', texto. A mensalidade de agosto é de agosto mesmo
--    que a família pague em setembro — é o que a Jéssica precisa enxergar para
--    saber quem está devendo. Data de pagamento é outro campo, de propósito.
--
-- 5. ÍNDICE ÚNICO PARCIAL para a mensalidade: (tenant, cliente, competência)
--    quando a categoria é 'mensalidade'. É o que torna "gerar as mensalidades do
--    mês" repetível sem duplicar cobrança se a Jéssica clicar duas vezes — o
--    banco recusa a segunda, o código não precisa lembrar de conferir.
--
-- 6. TENANT_ID EM TUDO, como no resto do produto (banco único compartilhado).
--    Sem isso, uma consulta esquecida vaza o financeiro de uma funerária para
--    outra — é o dado mais sensível que este sistema vai guardar.
--
-- SEGURANÇA: cria duas tabelas novas e cinco índices. Não altera nem lê nenhuma
-- tabela existente. Idempotente (IF NOT EXISTS).

CREATE TABLE IF NOT EXISTS cliente (
  id            TEXT PRIMARY KEY,
  tenant_id     TEXT NOT NULL REFERENCES tenant(id),
  nome          TEXT NOT NULL,
  telefone      TEXT,
  documento     TEXT,
  endereco      TEXT,
  observacao    TEXT,

  -- plano funerário (ver decisão 2). Sem plano: plano_ativo = 0 e valor NULL.
  plano_ativo            INTEGER NOT NULL DEFAULT 0,
  plano_valor_centavos   INTEGER,
  plano_dia_vencimento   INTEGER,          -- 1..28, ver decisão abaixo
  plano_inicio           TEXT,             -- 'AAAA-MM-DD'

  ativo         INTEGER NOT NULL DEFAULT 1,
  criado_em     TEXT NOT NULL DEFAULT (datetime('now')),

  -- Dia 1..28 e não 1..31: fevereiro. Um plano que vence "dia 31" não tem
  -- vencimento em 11 meses do ano, e a regra de "cai para o último dia" é
  -- exatamente o tipo de detalhe que ninguém lembra de implementar.
  CHECK (plano_dia_vencimento IS NULL OR (plano_dia_vencimento BETWEEN 1 AND 28)),
  CHECK (plano_valor_centavos IS NULL OR plano_valor_centavos >= 0)
);

CREATE INDEX IF NOT EXISTS idx_cliente_tenant      ON cliente (tenant_id, ativo, nome);
CREATE INDEX IF NOT EXISTS idx_cliente_tenant_plano ON cliente (tenant_id, plano_ativo);

CREATE TABLE IF NOT EXISTS lancamento (
  id             TEXT PRIMARY KEY,
  tenant_id      TEXT NOT NULL REFERENCES tenant(id),
  cliente_id     TEXT REFERENCES cliente(id),   -- NULL: despesa, ou entrada avulsa

  tipo           TEXT NOT NULL,                 -- 'entrada' | 'saida'
  categoria      TEXT NOT NULL,                 -- 'mensalidade' | 'atendimento' | 'outra' | despesas
  descricao      TEXT,
  valor_centavos INTEGER NOT NULL,

  competencia    TEXT NOT NULL,                 -- 'AAAA-MM' (ver decisão 4)
  vencimento     TEXT,                          -- 'AAAA-MM-DD', opcional
  pago_em        TEXT,                          -- NULL = em aberto (ver decisão 3)

  criado_em      TEXT NOT NULL DEFAULT (datetime('now')),

  CHECK (tipo IN ('entrada', 'saida')),
  CHECK (valor_centavos >= 0),
  CHECK (length(competencia) = 7)
);

CREATE INDEX IF NOT EXISTS idx_lancamento_competencia
  ON lancamento (tenant_id, competencia, tipo);

CREATE INDEX IF NOT EXISTS idx_lancamento_aberto
  ON lancamento (tenant_id, pago_em, vencimento);

CREATE INDEX IF NOT EXISTS idx_lancamento_cliente
  ON lancamento (tenant_id, cliente_id, competencia);

-- Ver decisão 5: torna a geração das mensalidades do mês repetível.
CREATE UNIQUE INDEX IF NOT EXISTS uniq_mensalidade_mes
  ON lancamento (tenant_id, cliente_id, competencia)
  WHERE categoria = 'mensalidade';
