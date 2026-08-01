-- Seed de desenvolvimento / primeiro tenant. NÃO é migration (não roda em
-- prod automaticamente). Reproduz os dados que hoje vivem no memorial-data.ts.
-- Idempotente: limpa e reinsere o tenant de demonstração.

DELETE FROM homenagem WHERE tenant_id = 't-demo';
DELETE FROM foto WHERE memorial_id IN (SELECT id FROM memorial WHERE tenant_id = 't-demo');
DELETE FROM evento WHERE memorial_id IN (SELECT id FROM memorial WHERE tenant_id = 't-demo');
DELETE FROM memorial WHERE tenant_id = 't-demo';
DELETE FROM sessao WHERE tenant_id = 't-demo';
DELETE FROM usuario WHERE tenant_id = 't-demo';
DELETE FROM tenant WHERE id = 't-demo';

INSERT INTO tenant (id, slug, nome, cidade, uf, telefone, whatsapp, endereco, desde, sobre, cor_marca)
VALUES (
  't-demo', 'funeraria-demonstracao', 'Funerária Demonstração',
  'Catanduvas', 'PR', '(45) 3253-1234', '5545999990000',
  'Rua Sete de Setembro, 120 · Centro', '1987',
  'Há mais de três décadas cuidamos das famílias de Catanduvas e região com respeito, discrição e atendimento a qualquer hora. Um só telefone, uma equipe que conhece a cidade e acompanha cada detalhe.',
  '#B5623F'
);

-- Admin sem senha ainda: define no 1º acesso (Fase 3). O convite_token abaixo
-- é só de DEV (tenant de demonstração); clientes reais recebem token aleatório.
INSERT INTO usuario (id, tenant_id, nome, email, papel, ativo, convite_token, convite_expira)
VALUES ('u-admin', 't-demo', 'Administrador', 'admin@funerariademonstracao.com.br',
  'admin', 1, 'convite-demo-inicial', datetime('now', '+3650 days'));

-- ---- Dona Nair -----------------------------------------------------------
INSERT INTO memorial (id, tenant_id, slug, nome_completo, apelido, foto_url,
  nascimento_iso, cidade_nascimento, falecimento_iso, cidade_falecimento, idade,
  epitafio, historia, visitas, autorizado_por, moderar_mensagens, status, publicado_em)
VALUES ('m-nair', 't-demo', 'nair-aparecida-de-souza', 'Nair Aparecida de Souza',
  'Dona Nair', NULL, '1948-03-12', 'Catanduvas · PR', '2026-07-28', 'Cascavel · PR', 78,
  'Onde havia café quente, havia lugar para todos.',
  'Nair Aparecida de Souza nasceu na zona rural de Catanduvas, a mais velha de sete irmãos, e aprendeu cedo que a casa se mede pelo tanto de gente que cabe nela. Costurava, plantava e recebia — sempre com um café pronto no fogão.

Casou-se com Sebastião em 1968 e com ele viveu 54 anos. Criou cinco filhos e ajudou a criar doze netos, e para cada um guardava uma história, um conselho e um prato feito com as próprias mãos.

Foi catequista na paróquia por mais de trinta anos. Quem passou pela sua sala aprendeu que fé, para Dona Nair, era coisa de gesto: visitar o doente, acolher o vizinho, não deixar ninguém sem resposta. Partiu em casa, cercada pela família que formou.',
  1284, 'Maria de Souza (filha)', 0, 'publicado', datetime('now', '-2 hours'));

INSERT INTO evento (id, memorial_id, tipo, local_nome, endereco, inicio_iso, horario_confirmado, ordem) VALUES
  ('e-nair-1', 'm-nair', 'velorio', 'Capela Memorial São José', 'Av. Brasil, 980 · Catanduvas/PR', '2026-07-28T19:00:00-03:00', 1, 0),
  ('e-nair-2', 'm-nair', 'sepultamento', 'Cemitério Municipal de Catanduvas', NULL, NULL, 0, 1);

INSERT INTO foto (id, memorial_id, url, ordem) VALUES
  ('f-nair-1', 'm-nair', 'https://img.usecurling.com/p/400/400?q=grandmother%20portrait&seed=11', 0),
  ('f-nair-2', 'm-nair', 'https://img.usecurling.com/p/400/400?q=family%20garden%20vintage&seed=12', 1),
  ('f-nair-3', 'm-nair', 'https://img.usecurling.com/p/400/400?q=elderly%20woman%20smiling&seed=13', 2),
  ('f-nair-4', 'm-nair', 'https://img.usecurling.com/p/400/400?q=old%20family%20photo&seed=14', 3),
  ('f-nair-5', 'm-nair', 'https://img.usecurling.com/p/400/400?q=grandmother%20kitchen&seed=15', 4);

INSERT INTO homenagem (id, memorial_id, tenant_id, nome, texto, vela, status, criado_em) VALUES
  ('h-nair-1', 'm-nair', 't-demo', 'Roberto', 'Meus sentimentos a toda a família.', 1, 'aprovada', datetime('now', '-1 hours')),
  ('h-nair-2', 'm-nair', 't-demo', 'Marli e família', 'Dona Nair vai fazer muita falta na nossa rua. Que Deus conforte a todos. 🙏', 0, 'aprovada', datetime('now', '-2 hours')),
  ('h-nair-3', 'm-nair', 't-demo', 'Aline', 'Que a luz desta vela ilumine seu caminho.', 1, 'aprovada', datetime('now', '-3 hours')),
  ('h-nair-4', 'm-nair', 't-demo', 'Pe. Antônio', 'Uma vida inteira dedicada à fé e à família. Rezaremos por ela.', 0, 'aprovada', datetime('now', '-4 hours')),
  ('h-nair-5', 'm-nair', 't-demo', 'Cleuza (vizinha)', 'Sempre com um café pronto e um sorriso. Foi minha segunda mãe. Descanse em paz.', 0, 'aprovada', datetime('now', '-5 hours')),
  ('h-nair-6', 'm-nair', 't-demo', 'Sônia', NULL, 1, 'aprovada', datetime('now', '-1 days'));

-- ---- José Carlos ---------------------------------------------------------
INSERT INTO memorial (id, tenant_id, slug, nome_completo, apelido, foto_url,
  nascimento_iso, cidade_nascimento, falecimento_iso, cidade_falecimento, idade,
  epitafio, historia, visitas, autorizado_por, moderar_mensagens, status, publicado_em)
VALUES ('m-jose', 't-demo', 'jose-carlos-lima', 'José Carlos Lima', 'Zé do Posto',
  'https://img.usecurling.com/p/400/500?q=elderly%20man%20portrait&seed=21',
  '1955-09-20', 'Cascavel · PR', '2026-07-27', 'Catanduvas · PR', 70,
  'Atendia todo mundo pelo nome.', NULL, 412, 'Sandra Lima (esposa)', 0, 'publicado', datetime('now', '-1 days'));

INSERT INTO evento (id, memorial_id, tipo, local_nome, endereco, inicio_iso, horario_confirmado, ordem) VALUES
  ('e-jose-1', 'm-jose', 'velorio', 'Capela Municipal', 'Rua XV de Novembro, 45 · Catanduvas/PR', '2026-07-27T14:00:00-03:00', 1, 0),
  ('e-jose-2', 'm-jose', 'sepultamento', 'Cemitério Municipal de Catanduvas', NULL, '2026-07-28T10:00:00-03:00', 1, 1);

INSERT INTO homenagem (id, memorial_id, tenant_id, nome, texto, vela, status, criado_em) VALUES
  ('h-jose-1', 'm-jose', 't-demo', 'Turma do posto', NULL, 1, 'aprovada', datetime('now', '-8 hours'));

-- ---- Therezinha ----------------------------------------------------------
INSERT INTO memorial (id, tenant_id, slug, nome_completo, apelido, foto_url,
  nascimento_iso, cidade_nascimento, falecimento_iso, cidade_falecimento, idade,
  epitafio, historia, visitas, autorizado_por, moderar_mensagens, status, publicado_em)
VALUES ('m-tere', 't-demo', 'therezinha-alves', 'Therezinha Alves', 'Dona Tetê', NULL,
  '1940-01-15', 'Guarapuava · PR', '2026-07-25', 'Catanduvas · PR', 86,
  NULL, NULL, 233, 'Marcos Alves (filho)', 1, 'publicado', datetime('now', '-3 days'));

INSERT INTO evento (id, memorial_id, tipo, local_nome, endereco, inicio_iso, horario_confirmado, ordem) VALUES
  ('e-tere-1', 'm-tere', 'velorio', 'Capela Memorial São José', 'Av. Brasil, 980 · Catanduvas/PR', NULL, 0, 0);

-- ---- Antônio -------------------------------------------------------------
INSERT INTO memorial (id, tenant_id, slug, nome_completo, apelido, foto_url,
  nascimento_iso, cidade_nascimento, falecimento_iso, cidade_falecimento, idade,
  epitafio, historia, visitas, autorizado_por, moderar_mensagens, status, publicado_em)
VALUES ('m-antonio', 't-demo', 'antonio-dos-santos', 'Antônio dos Santos', NULL,
  'https://img.usecurling.com/p/400/500?q=old%20man%20hat%20portrait&seed=24',
  '1962-11-02', 'Catanduvas · PR', '2026-07-22', 'Cascavel · PR', 63,
  'A viola cala, a música fica.', NULL, 851, 'Célia dos Santos (irmã)', 0, 'publicado', datetime('now', '-9 days'));

INSERT INTO evento (id, memorial_id, tipo, local_nome, endereco, inicio_iso, horario_confirmado, ordem) VALUES
  ('e-antonio-1', 'm-antonio', 'velorio', 'Capela Municipal', 'Rua XV de Novembro, 45 · Catanduvas/PR', '2026-07-22T18:00:00-03:00', 1, 0);

INSERT INTO homenagem (id, memorial_id, tenant_id, nome, texto, vela, status, criado_em) VALUES
  ('h-antonio-1', 'm-antonio', 't-demo', 'Grupo de viola', 'Até sempre, mestre.', 1, 'aprovada', datetime('now', '-2 days'));
