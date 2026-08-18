-- Papel "gestor" (lado SaaS) separado de "admin" (lado funerária) — 18/08/2026.
--
-- Pedido do Felipe: a funerária não pode ver, desativar, remover nem redefinir a
-- senha da conta de gestão do SaaS. Hoje as três contas do tenant têm o mesmo
-- `papel = 'admin'`, então a Jéssica enxerga e pode mexer nas contas do Felipe —
-- inclusive removê-las e ficar sem suporte, ou desativá-las por engano.
--
-- REGRA QUE PASSA A VALER (aplicada no código, não só aqui):
--   - quem NÃO é `gestor` não vê as contas `gestor` na lista;
--   - quem NÃO é `gestor` não pode alterar, desativar, remover nem gerar convite
--     para uma conta `gestor`;
--   - `gestor` continua vendo e administrando tudo.
--
-- Isto NÃO é isolamento de dados entre funerárias (isso já existe pelo
-- tenant_id): é hierarquia de acesso dentro do mesmo tenant.
--
-- SEGURANÇA: dois UPDATE com e-mail explícito no WHERE. Nenhuma linha apagada.
-- Idempotente. A conta da funerária (jessicaborak@) permanece `admin`.

UPDATE usuario SET papel = 'gestor'
 WHERE email IN ('equipeavassaladora@gmail.com', 'atendimento.vassalo@gmail.com');
