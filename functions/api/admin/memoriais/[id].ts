/* GET/PUT/DELETE /api/admin/memoriais/:id */
import type { Env } from '../../../_lib/types'
import type { AdminData } from '../_middleware'
import {
  getTenantPorId,
  getMemorialAdmin,
  atualizarMemorial,
  deletarMemorial,
  getUrlsFotosMemorial,
  apagarFotosR2,
} from '../../../_lib/db'
import { memorialInputSchema } from '../../../_lib/schemas'
import { json, erro, lerJson } from '../../../_lib/http'

export const onRequestGet: PagesFunction<Env, 'id', AdminData> = async ({
  env,
  params,
  data,
}) => {
  const tenant = await getTenantPorId(env, data.sessao.tenantId)
  if (!tenant) return erro('Funerária não encontrada.', 404)
  const memorial = await getMemorialAdmin(env, tenant, String(params.id))
  if (!memorial) return erro('Memorial não encontrado.', 404)
  return json({ memorial })
}

export const onRequestPut: PagesFunction<Env, 'id', AdminData> = async ({
  env,
  request,
  params,
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
  const slug = await atualizarMemorial(
    env,
    data.sessao.tenantId,
    String(params.id),
    parsed.data,
  )
  if (!slug) return erro('Memorial não encontrado.', 404)
  return json({ ok: true, slug })
}

export const onRequestDelete: PagesFunction<Env, 'id', AdminData> = async ({
  env,
  params,
  data,
  waitUntil,
}) => {
  const id = String(params.id)
  // remove as fotos do R2 junto (direito à exclusão — LGPD)
  const urls = await getUrlsFotosMemorial(env, data.sessao.tenantId, id)
  const ok = await deletarMemorial(env, data.sessao.tenantId, id)
  if (!ok) return erro('Memorial não encontrado.', 404)
  waitUntil(apagarFotosR2(env, urls))
  return json({ ok: true })
}
