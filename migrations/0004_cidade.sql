-- U0 / parte 1 — Cidade como chave do índice do obituario.com.br.
--
-- POR QUE: as rotas do guarda-chuva (/<cidade> e /<cidade>/<slug>) precisam de
-- uma cidade canônica por nota. O banco não tinha: `cidade_nascimento` e
-- `cidade_falecimento` são texto livre, anuláveis e não representam a praça de
-- atuação. Decisão D2 (06/08): a cidade da nota é SEMPRE a da funerária que
-- publicou — a contratação é local.
--
-- SEGURANÇA: somente CREATE TABLE / ADD COLUMN / CREATE INDEX. Nada é apagado
-- nem alterado. As colunas nascem NULL e nenhum código as lê ainda.

CREATE TABLE IF NOT EXISTS cidade (
  id        TEXT PRIMARY KEY,
  slug      TEXT NOT NULL UNIQUE,   -- segmento da URL: obituario.com.br/<slug>
  nome      TEXT NOT NULL,
  uf        TEXT NOT NULL,
  criado_em TEXT NOT NULL DEFAULT (datetime('now'))
);

ALTER TABLE memorial ADD COLUMN cidade_id TEXT REFERENCES cidade(id);
ALTER TABLE tenant   ADD COLUMN cidade_id TEXT REFERENCES cidade(id);

-- Consulta do índice da cidade (cross-tenant, publicados, mais recentes antes).
CREATE INDEX IF NOT EXISTS idx_memorial_indice
  ON memorial (cidade_id, status, falecimento_iso);

-- NÃO criar aqui o UNIQUE (cidade_id, slug): só depois do backfill e da query
-- de colisão. Ver 0004b_unique_slug.sql.
