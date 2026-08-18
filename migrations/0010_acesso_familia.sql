-- Acesso da família ao próprio memorial, por link com token (18/08/2026).
--
-- Decidido em 12/08/2026 e nunca construído até hoje: "a nota nasce sem
-- história; a família recebe link com token (escopo editar, 30 dias) para
-- escrever a história, subir fotos e ocultar mensagens".
--
-- POR QUE TOKEN E NÃO LOGIN: a família não é usuária do sistema. Criar conta
-- para quem acabou de perder alguém, no dia do velório, é pedir a coisa errada
-- na hora errada. O link chega pelo WhatsApp, funciona no celular, e expira.
--
-- DECISÕES:
--
-- 1. Token no MEMORIAL, não em tabela nova. É um por memorial, some quando o
--    memorial some, e a consulta é sempre "achar o memorial por este token".
--
-- 2. EXPIRA. 30 dias por padrão, contados da emissão. Link de edição que vale
--    para sempre é credencial permanente circulando em grupo de WhatsApp.
--
-- 3. É REEMISSÍVEL. A funerária gera de novo quando a família perde o link, e o
--    anterior deixa de valer na hora (o campo é sobrescrito).
--
-- 4. NÃO dá acesso a nada além daquele memorial. Nem a outro falecido, nem ao
--    painel, nem a dado financeiro.
--
-- SEGURANÇA: dois ALTER e um índice. Não altera linha existente, não apaga nada.

ALTER TABLE memorial ADD COLUMN familia_token TEXT;
ALTER TABLE memorial ADD COLUMN familia_expira TEXT;

-- Busca do memorial pelo token. Parcial: só as linhas que têm token.
CREATE UNIQUE INDEX IF NOT EXISTS uniq_memorial_familia_token
  ON memorial (familia_token) WHERE familia_token IS NOT NULL;
