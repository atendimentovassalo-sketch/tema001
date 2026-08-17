-- Rate-limit / lockout do login do painel (17/08/2026).
--
-- MOTIVO: `POST /api/auth/login` não tinha nenhuma proteção contra força bruta —
-- nem contagem, nem atraso, nem bloqueio. A proteção estava invertida: o endpoint
-- público de homenagem tem honeypot + teto de 5/min por IP, e o endpoint que dá
-- acesso ao painel da funerária não tinha nada. Achado em 13/08, registrado em
-- SAAS-FUNERARIAS/DECISOES.md; subiu de prioridade em 17/08 porque o painel vai
-- passar a guardar cadastro de famílias e o financeiro da funerária.
--
-- DECISÕES DESTA TABELA:
--
-- 1. Guarda SÓ tentativas que FALHARAM. Login que dá certo não vira linha aqui
--    (e ainda apaga as falhas anteriores daquela chave) — quem erra 4 vezes e
--    acerta na quinta não fica a um erro do bloqueio no dia seguinte.
--
-- 2. Nem IP nem e-mail entram em claro. `ip_hash` reusa o mesmo helper do
--    rate-limit de homenagens (SHA-256 com sal, 32 hex). `email_hash` recebe o
--    mesmo tratamento: sem isso, esta tabela viraria um registro em texto puro
--    dos e-mails que um atacante chutou.
--
-- 3. A chave do bloqueio é o PAR (ip_hash, email_hash). Só por e-mail, qualquer
--    um tranca a Jéssica de fora só errando a senha dela de propósito — o
--    lockout viraria a própria negação de serviço. Só por IP, um atacante varre
--    e-mails à vontade dentro da cota.
--
-- 4. Sem chave estrangeira para `usuario`: e-mail inexistente também é tentativa
--    e precisa ser contado, senão a varredura de e-mails fica de graça.
--
-- SEGURANÇA: cria uma tabela nova e dois índices. Não altera nem lê nenhuma
-- tabela existente. Idempotente (IF NOT EXISTS).

CREATE TABLE IF NOT EXISTS login_tentativa (
  id         TEXT PRIMARY KEY,
  ip_hash    TEXT NOT NULL,
  email_hash TEXT NOT NULL,
  criado_em  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Índice da consulta do rate-limit: (par, janela de tempo).
CREATE INDEX IF NOT EXISTS idx_login_tentativa_chave
  ON login_tentativa (ip_hash, email_hash, criado_em);

-- Índice da limpeza oportunista de linhas velhas.
CREATE INDEX IF NOT EXISTS idx_login_tentativa_criado_em
  ON login_tentativa (criado_em);
