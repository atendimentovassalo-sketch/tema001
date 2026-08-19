-- Parcelamento de lançamentos (18/08/2026).
--
-- PEDIDO DO FELIPE: registrar entrada ou saída "à vista ou parcelado
-- (informando o valor mensal e o número de parcelas), de modo a já programar os
-- parcelamentos nos meses correspondentes". A família pode pagar um atendimento
-- em N vezes, e o gestor precisa enxergar o fluxo futuro, não só o mês de hoje.
--
-- POR QUE NÃO UMA TABELA NOVA: `lancamento` já tem `competencia` ('AAAA-MM'),
-- que é exatamente "em que mês esta parcela entra". Uma compra em 6x são 6
-- linhas, uma por mês — e todo o resto do sistema (resumo do mês, em aberto,
-- relatório do contador, baixa de pagamento) já sabe lidar com linha por mês,
-- sem uma única alteração. Tabela separada exigiria reescrever tudo isso para
-- ler de dois lugares.
--
-- O QUE AS COLUNAS RESOLVEM: sem elas, 6 linhas iguais em 6 meses são
-- indistinguíveis de 6 lançamentos avulsos parecidos. `parcela_grupo` diz que
-- são a mesma compra; `parcela_num`/`parcela_de` dizem "3 de 6", que é o que a
-- tela mostra e o que permite, no futuro, cancelar o parcelamento inteiro.
--
-- Anuláveis: lançamento à vista continua com as três vazias — que é a verdade,
-- não uma lacuna. Nenhuma linha existente muda.

ALTER TABLE lancamento ADD COLUMN parcela_grupo TEXT;
ALTER TABLE lancamento ADD COLUMN parcela_num   INTEGER;
ALTER TABLE lancamento ADD COLUMN parcela_de    INTEGER;

CREATE INDEX IF NOT EXISTS idx_lancamento_parcela
  ON lancamento (tenant_id, parcela_grupo);
