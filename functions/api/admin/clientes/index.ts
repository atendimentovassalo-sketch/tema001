/* GET  /api/admin/clientes -> lista do tenant (?inativos=1 inclui arquivados)
 * POST /api/admin/clientes -> cadastra */
import type { Env } from '../../../_lib/types'
import type { AdminData } from '../_middleware'
import { listClientes, inserirCliente } from '../../../_lib/db'
import { clienteInputSchema } from '../../../_lib/schemas'
import { json, erro, lerJson } from '../../../_lib/http'

export const onRequestGet: PagesFunction<Env, string, AdminData> = async ({
  env,
  request,
  data,
}) => {
  const incluirInativos = new URL(request.url).searchParams.get('inativos') === '1'
  const clientes = await listClientes(env, data.sessao.tenantId, incluirInativos)
  return json({ clientes })
}

export const onRequestPost: PagesFunction<Env, string, AdminData> = async ({
  env,
  request,
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
  const id = await inserirCliente(env, data.sessao.tenantId, parsed.data)
  return json({ ok: true, id }, 201)
}
