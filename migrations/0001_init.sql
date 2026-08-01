-- Schema inicial do SaaS de memoriais (Cloudflare D1 / SQLite).
-- Multi-tenant desde a fundação: tudo carrega tenant_id, mesmo no lançamento
-- single-tenant. IDs são TEXT (UUID gerado na aplicação).

PRAGMA foreign_keys = ON;

-- Funerária (inquilino).
CREATE TABLE IF NOT EXISTS tenant (
  id            TEXT PRIMARY KEY,
  slug          TEXT NOT NULL UNIQUE,       -- identificador/futuro subdomínio
  nome          TEXT NOT NULL,
  cidade        TEXT NOT NULL,
  uf            TEXT NOT NULL,
  telefone      TEXT NOT NULL,
  whatsapp      TEXT NOT NULL,
  endereco      TEXT,
  desde         TEXT,
  sobre         TEXT,
  cor_marca     TEXT NOT NULL DEFAULT '#B5623F',
  criado_em     TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Usuário administrativo da funerária.
CREATE TABLE IF NOT EXISTS usuario (
  id             TEXT PRIMARY KEY,
  tenant_id      TEXT NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
  nome           TEXT NOT NULL,
  email          TEXT NOT NULL UNIQUE,
  senha_hash     TEXT,                       -- null até o 1º acesso definir a senha
  senha_salt     TEXT,
  papel          TEXT NOT NULL DEFAULT 'admin',
  ativo          INTEGER NOT NULL DEFAULT 1,
  convite_token  TEXT,                        -- 1º acesso / redefinição
  convite_expira TEXT,
  ultimo_acesso  TEXT,
  criado_em      TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Sessão (cookie httpOnly guarda apenas o id).
CREATE TABLE IF NOT EXISTS sessao (
  id          TEXT PRIMARY KEY,              -- token aleatório (256 bits)
  usuario_id  TEXT NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
  tenant_id   TEXT NOT NULL,
  expira_em   TEXT NOT NULL,
  criado_em   TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Memorial (nota de falecimento).
CREATE TABLE IF NOT EXISTS memorial (
  id                TEXT PRIMARY KEY,
  tenant_id         TEXT NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
  slug              TEXT NOT NULL,
  nome_completo     TEXT NOT NULL,
  apelido           TEXT,
  foto_url          TEXT,
  nascimento_iso    TEXT,
  cidade_nascimento TEXT,
  falecimento_iso   TEXT NOT NULL,
  cidade_falecimento TEXT,
  idade             INTEGER,
  epitafio          TEXT,
  historia          TEXT,
  visitas           INTEGER NOT NULL DEFAULT 0,
  autorizado_por    TEXT,
  moderar_mensagens INTEGER NOT NULL DEFAULT 0,
  status            TEXT NOT NULL DEFAULT 'rascunho',  -- rascunho | publicado
  criado_em         TEXT NOT NULL DEFAULT (datetime('now')),
  publicado_em      TEXT,
  UNIQUE (tenant_id, slug)
);

-- Evento do memorial (velório, cerimônia, sepultamento).
CREATE TABLE IF NOT EXISTS evento (
  id                 TEXT PRIMARY KEY,
  memorial_id        TEXT NOT NULL REFERENCES memorial(id) ON DELETE CASCADE,
  tipo               TEXT NOT NULL,           -- velorio | cerimonia | sepultamento
  local_nome         TEXT NOT NULL,
  endereco           TEXT,
  inicio_iso         TEXT,
  horario_confirmado INTEGER NOT NULL DEFAULT 0,
  ordem              INTEGER NOT NULL DEFAULT 0
);

-- Foto do álbum do memorial.
CREATE TABLE IF NOT EXISTS foto (
  id          TEXT PRIMARY KEY,
  memorial_id TEXT NOT NULL REFERENCES memorial(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  alt         TEXT,
  ordem       INTEGER NOT NULL DEFAULT 0
);

-- Homenagem (mensagem e/ou vela).
CREATE TABLE IF NOT EXISTS homenagem (
  id            TEXT PRIMARY KEY,
  memorial_id   TEXT NOT NULL REFERENCES memorial(id) ON DELETE CASCADE,
  tenant_id     TEXT NOT NULL,
  nome          TEXT NOT NULL,
  texto         TEXT,
  vela          INTEGER NOT NULL DEFAULT 0,
  status        TEXT NOT NULL DEFAULT 'aprovada',  -- pendente | aprovada | recusada
  aprovar_token TEXT,                                -- link /aprovar/:token
  ip_hash       TEXT,                                -- abuso/rate-limit (sem PII crua)
  criado_em     TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_memorial_lista
  ON memorial (tenant_id, status, falecimento_iso);
CREATE INDEX IF NOT EXISTS idx_evento_memorial ON evento (memorial_id, ordem);
CREATE INDEX IF NOT EXISTS idx_foto_memorial ON foto (memorial_id, ordem);
CREATE INDEX IF NOT EXISTS idx_homenagem_memorial
  ON homenagem (memorial_id, status, criado_em);
CREATE INDEX IF NOT EXISTS idx_homenagem_token ON homenagem (aprovar_token);
CREATE INDEX IF NOT EXISTS idx_sessao_expira ON sessao (expira_em);
CREATE INDEX IF NOT EXISTS idx_usuario_email ON usuario (email);
