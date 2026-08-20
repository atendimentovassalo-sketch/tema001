-- Cabeçalho e rodapé por inquilino (20/08/2026).
--
-- POR QUE: o cabeçalho/rodapé do app (SiteChrome.tsx) trazia o nome, o
-- telefone, o e-mail, o endereço e as cidades da Funerária São Francisco
-- ESCRITOS NO CÓDIGO. Como a casca envolve toda página de memorial e de
-- obituário, no dia em que a segunda funerária entrasse, as páginas dela
-- exibiriam os dados da primeira — uma família enlutada em outra cidade
-- ligaria para a funerária errada. Estas colunas movem o que faltava do
-- código para o inquilino.
--
-- Todas são NULL por padrão: quem não tem site institucional (o caso comum —
-- a funerária que só usa o obituário) simplesmente não mostra esses blocos,
-- em vez de mostrar links quebrados para páginas que não existem.

ALTER TABLE tenant ADD COLUMN email TEXT;          -- contato público do rodapé
ALTER TABLE tenant ADD COLUMN site_menu TEXT;      -- JSON do menu do site institucional
ALTER TABLE tenant ADD COLUMN site_horario TEXT;   -- horário de atendimento (texto livre)
ALTER TABLE tenant ADD COLUMN site_legal TEXT;     -- CNPJ / alvará / razão social

-- São Francisco: exatamente o que estava escrito no código, para que o site do
-- cliente no ar não perca nada. `itens` = submenu ("Áreas atendidas").
UPDATE tenant SET
  email = 'atendimento@funerariacatanduvas.com.br',
  site_menu = '[{"rotulo":"Home","href":"/"},{"rotulo":"Planos","href":"/planos"},{"rotulo":"Obituários","href":"/obituario"},{"rotulo":"Áreas atendidas","itens":[{"rotulo":"Catanduvas","href":"/cidade-catanduvas"},{"rotulo":"Ibema","href":"/cidade-ibema"},{"rotulo":"Três Barras do Paraná","href":"/cidade-tres-barras-do-parana"}]}]',
  site_horario = 'Atendimento presencial das 8h às 18h.
Plantão telefônico 24 horas, todos os dias.',
  site_legal = 'CNPJ 79.036.497/0001-58
Alvará nº 105, de 1989
Carvalho & Borak Ltda'
WHERE slug = 'sanfrancisco';

-- Funerária Modelo: a demonstração que a página de vendas mostra ao dono de
-- funerária. O WhatsApp dela é o do Óbitos de propósito — quem abre a nota de
-- exemplo e toca no botão está falando com quem vende, não com um número
-- inventado (que era o caso) nem com a São Francisco (que era o efeito do
-- número escrito no código). Sem site_menu: a Modelo não tem site
-- institucional, então o menu cai no mínimo (só o obituário).
UPDATE tenant SET
  telefone = '(11) 97220-2266',
  whatsapp = '5511972202266'
WHERE id = 't-modelo';
