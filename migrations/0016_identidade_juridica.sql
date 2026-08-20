-- Identidade jurídica e logo por inquilino (20/08/2026).
--
-- POR QUE: /privacidade e /termos são servidas em TODO domínio do produto e
-- nomeavam "Carvalho & Borak Ltda (Funerária São Francisco), CNPJ
-- 79.036.497/0001-58", com sede em Catanduvas e foro na comarca de Catanduvas.
-- A política de privacidade da próxima funerária declararia como controladora
-- de dados uma empresa que não é ela — não é um defeito de layout, é um
-- documento jurídico errado publicado no domínio dela. Mesma coisa com a logo
-- em /logo.png no painel: era a da São Francisco para todo mundo (e na demo
-- nem existe, dava imagem quebrada).
--
-- Campos ESTRUTURADOS, não texto livre, porque as frases dos documentos são
-- montadas a partir deles ("O controlador dos dados é X, inscrita no CNPJ sob
-- nº Y, com sede em Z"). Todos NULL por padrão: as frases são compostas para
-- degradar com gramática correta quando um campo falta, em vez de imprimir
-- lacuna ou um dado inventado.

ALTER TABLE tenant ADD COLUMN razao_social TEXT;  -- Carvalho & Borak Ltda
ALTER TABLE tenant ADD COLUMN cnpj TEXT;
ALTER TABLE tenant ADD COLUMN alvara TEXT;        -- só aparece no rodapé
ALTER TABLE tenant ADD COLUMN dpo_email TEXT;     -- Encarregado (LGPD)
ALTER TABLE tenant ADD COLUMN foro_comarca TEXT;  -- "Catanduvas, Estado do Paraná"

-- `logo_url` NÃO é criada aqui: a coluna já existia na base (junto com
-- `site_url` e `cidade_id`, de uma migration que não está no diretório — ver o
-- item de bookkeeping do D1 no DECISOES). Estava NULL nos dois inquilinos, ou
-- seja, criada e esquecida. A partir de agora é ela que o painel usa.

-- São Francisco: exatamente o que os documentos no ar já dizem, para que nada
-- mude para a cliente. `site_legal` (migration 0015) vai a NULL de propósito:
-- ele guardava o MESMO CNPJ em texto livre, e dois lugares com o mesmo CNPJ é
-- o tipo de coisa que se atualiza pela metade. O bloco "Empresa" do rodapé
-- passa a ser montado a partir destes campos.
UPDATE tenant SET
  razao_social = 'Carvalho & Borak Ltda',
  cnpj         = '79.036.497/0001-58',
  alvara       = 'Alvará nº 105, de 1989',
  dpo_email    = 'equipeavassaladora@gmail.com',
  foro_comarca = 'Catanduvas, Estado do Paraná',
  logo_url     = '/logo.png',
  site_legal   = NULL
WHERE slug = 'sanfrancisco';

-- Funerária Modelo fica sem nada disso de propósito: é demonstração, e um CNPJ
-- inventado num documento jurídico público seria pior do que a ausência dele.
-- As páginas legais dela saem no ar dizendo "a Funerária Modelo", sem CNPJ e
-- sem foro eleito — que é a verdade.
