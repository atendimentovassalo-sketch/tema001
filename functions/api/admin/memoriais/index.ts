/* GET  /api/admin/memoriais -> lista (todos os status) do tenant + pendentes
 * POST /api/admin/memoriais -> cria memorial (rascunho) */
import type { Env } from '../../../_lib/types'
import type { AdminData } from '../_middleware'
import { listMemoriaisAdmin, inserirMemorial } from '../../../_lib/db'
import { memorialInputSchema } from '../../../_lib/schemas'
import { json, erro, lerJson } from '../../../_lib/http'

export const onRequestGet: PagesFunction<Env, string, AdminData> = async ({
  env,
  data,
}) => {
  const memoriais = await listMemoriaisAdmin(env, data.sessao.tenantId)
  return json({ memoriais })
}

export const onRequestPost: PagesFunction<Env, string, AdminData> = async ({
  env,
  request,
  data,
}) => {
  let body: unknown
  try {
    body = await lerJson(request, 32_768)
  } catch {
    return erro('Requisição inválida.', 400)
  }
  const parsed = memorialInputSchema.safeParse(body)
  if (!parsed.success) {
    const i = parsed.error.issues[0]
    return erro(i?.message ?? 'Dados inválidos.', 422, { campo: i?.path.join('.') })
  }
  const { id, slug } = await inserirMemorial(env, data.sessao.tenantId, parsed.data)
  return json({ ok: true, id, slug }, 201)
}
