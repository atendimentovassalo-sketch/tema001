-- U0 / parte 3 — Backfill: preenche a cidade das notas que já existem.
--
-- ESTADO LIDO EM PRODUÇÃO (06/08/2026, somente SELECT):
--   tenant 5aa5c419… "Funerária São Francisco" — Catanduvas/PR — funerariacatanduvas.com.br
--   tenant t-modelo   "Funerária Modelo"       — "Cidade"/"UF"  — novomodelo.com.br  (DEMO)
--   memorial amalia-teresa-justen  (São Francisco, publicado)
--   memorial exemplo-memorial      (Modelo, publicado — DEMO)
--
-- DECISÕES DESTE BACKFILL:
--
-- 1. Só a São Francisco recebe cidade. O tenant `t-modelo` é demonstração e tem
--    cidade "Cidade"/"UF" (placeholder) — criar uma cidade a partir dele geraria
--    a URL pública `obituario.com.br/cidade`, lixo indexável. Ele fica com
--    cidade_id NULL, e nota com cidade_id NULL nunca aparece no índice: é
--    exatamente o comportamento desejado para a demo.
--
-- 2. Slug SEMPRE com UF: `<cidade>-<uf>` (decisão de 06/08). Colisão fica
--    impossível por construção — existe Catanduvas no PR e em SC, e o mesmo vale
--    para dezenas de cidades brasileiras. Sem regra de desempate para lembrar
--    depois, e sem assimetria entre cidades. Slug de cidade é URL permanente:
--    uma vez publicado, não muda sem quebrar link já circulado no WhatsApp.
--
-- 3. A nota real da São Francisco tem cidade_falecimento = "Cascavel" (a pessoa
--    faleceu no polo hospitalar). É por isso que esse campo NÃO é a chave: usá-lo
--    mandaria a única nota real do sistema para o índice de Cascavel em vez do de
--    Catanduvas. Aqui vale a cidade da funerária.
--
-- SEGURANÇA: um INSERT e dois UPDATE, ambos com WHERE explícito por id de
-- tenant. Nenhuma linha é apagada. Idempotente (INSERT OR IGNORE).

INSERT OR IGNORE INTO cidade (id, slug, nome, uf)
VALUES ('cid-catanduvas-pr', 'catanduvas-pr', 'Catanduvas', 'PR');

UPDATE tenant
   SET cidade_id = 'cid-catanduvas-pr'
 WHERE id = '5aa5c419-f341-4760-92e8-28f854e5a9ba';

UPDATE memorial
   SET cidade_id = 'cid-catanduvas-pr'
 WHERE tenant_id = '5aa5c419-f341-4760-92e8-28f854e5a9ba'
   AND cidade_id IS NULL;
