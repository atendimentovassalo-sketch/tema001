-- Tipo de vela escolhido por quem acende (18/08/2026).
--
-- Existiam 5 desenhos de vela produzidos em 08/08 (branca, alta, âmbar, cruz,
-- terço) que nunca chegaram à tela: a v5 cortou as versões em bitmap porque
-- pesavam 684 KB para aparecer a 62px. Os desenhos aqui são SVG inline — a
-- vela em SVG pesa ~1,2 KB, escala sem serrilhar e obedece
-- `prefers-reduced-motion`, coisa que GIF e WebP animado não fazem.
--
-- NULL = vela sem tipo (todas as que já existem). A tela cai no desenho padrão,
-- então nada quebra e nenhuma homenagem antiga precisa ser tocada.
--
-- SEGURANÇA: um ALTER. Não altera linha existente, não apaga nada.

ALTER TABLE homenagem ADD COLUMN vela_tipo TEXT;
