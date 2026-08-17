/* GET    /api/admin/clientes/:id -> um cliente do tenant
 * PUT    /api/admin/clientes/:id -> atualiza
 * DELETE /api/admin/clientes/:id -> ARQUIVA (ativo = 0), nunca apaga: o cliente
 *   tem lançamentos atrelados, e apagar cadastro com histórico financeiro é
 *   perda de dado, não limpeza. Mesma regra do resto do projeto. */
import type { Env } from '../../../_lib/types'
import type { AdminData } from '../_middleware'
import { getCliente, atualizarCliente, arquivarCliente } from '../../../_lib/db'
import { clienteInputSchema } from '../../../_lib/schemas'
import { json, erro, lerJson } from '../../../_lib/http'

export const onRequestGet: PagesFunction<Env, string, AdminData> = async ({
  env,
  params,
  data,
}) => {
  const cliente = await getCliente(env, data.sessao.tenantId, String(params.id))
  if (!cliente) return erro('Cliente não encontrado.', 404)
  return json({ cliente })
}

export const onRequestPut: PagesFunction<Env, string, AdminData> = async ({
  env,
  request,
  params,
  data,
}) => {
  let body: unknown
  try {
    body = await lerJson(request, 16_384)
  } catch {
    return erro('Requisição inválida.', 400)
  }
  const parsed = clienteInputSchema.safeParse(body)
  if (!parsed.success) {
    const i = parsed.error.issues[0]
    return erro(i?.message ?? 'Dados inválidos.', 422, { campo: i?.path.join('.') })
  }
  const ok = await atualizarCliente(
    env,
    data.sessao.tenantId,
    String(params.id),
    parsed.data,
  )
  if (!ok) return erro('Cliente não encontrado.', 404)
  return json({ ok: true })
}

export const onRequestDelete: PagesFunction<Env, string, AdminData> = async ({
  env,
  params,
  data,
}) => {
  const ok = await arquivarCliente(env, data.sessao.tenantId, String(params.id))
  if (!ok) return erro('Cliente não encontrado.', 404)
  return json({ ok: true })
}
