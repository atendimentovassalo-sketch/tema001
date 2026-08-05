-- Resolução de tenant por domínio público (Fase 0 da arquitetura replicável).
-- Coluna aditiva; múltiplos NULL são permitidos (o índice único trata NULLs
-- como distintos no SQLite), então tenants sem domínio setado convivem.
ALTER TABLE tenant ADD COLUMN dominio TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_tenant_dominio ON tenant (dominio);
