-- Rate-limit de autenticação: registra tentativas por hash de IP para conter
-- brute-force / credential-stuffing no login e na recuperação de senha.
-- SEGURANÇA: somente CREATE TABLE / CREATE INDEX.

CREATE TABLE IF NOT EXISTS tentativa_auth (
  id         TEXT PRIMARY KEY,
  ip_hash    TEXT NOT NULL,
  tipo       TEXT NOT NULL,            -- 'login' | 'recuperar'
  criado_em  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_tentativa_auth_ip
  ON tentativa_auth (ip_hash, tipo, criado_em);
