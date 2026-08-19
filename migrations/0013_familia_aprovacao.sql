-- A família aprova a nota e ela vai ao ar (18/08/2026).
--
-- DECISÃO DO FELIPE, nesta data, entre três caminhos possíveis: aprovar
-- PUBLICA na hora, E o aval fica registrado, E a funerária é avisada. O
-- argumento é o do velório: a nota precisa circular rápido, e esperar a
-- funerária voltar ao painel é tempo que ninguém tem. A funerária não perde o
-- controle — ela vê o que aconteceu e pode despublicar.
--
-- `autorizado_por` já existia (o "Publicação autorizada por Fulano" do rodapé)
-- e continua sendo preenchido pela funerária no editor. O que falta é saber
-- QUANDO a família aprovou, para o painel poder mostrar o fato e não só o
-- resultado. Uma coluna, anulável: nota publicada pela funerária continua com
-- ela vazia, que é a verdade.

ALTER TABLE memorial ADD COLUMN familia_aprovou_em TEXT;
