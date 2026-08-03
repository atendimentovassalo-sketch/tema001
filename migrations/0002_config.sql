-- Configurações do tenant: locais padrão (autofill do formulário) e modelo de
-- mensagem do WhatsApp. + override da mensagem por memorial.
ALTER TABLE tenant ADD COLUMN velorio_local_padrao TEXT;
ALTER TABLE tenant ADD COLUMN velorio_endereco_padrao TEXT;
ALTER TABLE tenant ADD COLUMN sepultamento_local_padrao TEXT;
ALTER TABLE tenant ADD COLUMN whatsapp_template TEXT;

ALTER TABLE memorial ADD COLUMN whatsapp_texto TEXT;
