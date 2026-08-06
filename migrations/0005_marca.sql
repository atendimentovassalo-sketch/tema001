-- U0 / parte 2 — Marca da funerária no guarda-chuva (decisão D3).
--
-- logo_url: logo exibida no header da nota white-label e no card do índice.
--           NULL = fallback tipográfico (monograma na cor_marca). Nenhum
--           tenant fica quebrado por não ter logo.
-- site_url: destino do clique no card do índice — o site próprio da funerária.
--           É o clique que vira lead. NULL = o card leva só ao WhatsApp.
--
-- SEGURANÇA: somente ADD COLUMN. Ambas nascem NULL e nenhum código as lê ainda.

ALTER TABLE tenant ADD COLUMN logo_url TEXT;
ALTER TABLE tenant ADD COLUMN site_url TEXT;
