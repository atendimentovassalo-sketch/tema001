/* GET/PUT /api/admin/config — dados da funerária, locais padrão e modelo de
 * mensagem do WhatsApp. */
import type { Env } from '../../_lib/types'
import type { AdminData } from './_middleware'
import {
  getTenantPorId,
  toConfigDTO,
  toFunerariaDTO,
  atualizarConfig,
} from '../../_lib/db'
import { configInputSchema } from '../../_lib/schemas'
import { json, erro, lerJson } from '../../_lib/http'

export const onRequestGet: PagesFunction<Env, string, AdminData> = async ({
  env,
  data,
}) => {
  const tenant = await getTenantPorId(env, data.sessao.tenantId)
  if (!tenant) return erro('Funerária não encontrada.', 404)
  /* `funeraria` vem junto porque as telas do dono usam a mesma casca de site
     das páginas públicas (SiteHeader), e a casca é dirigida pelo inquilino. */
  return json({ config: toConfigDTO(tenant), funeraria: toFunerariaDTO(tenant) })
}

export const onRequestPut: PagesFunction<Env, string, AdminData> = async ({
  env,
  request,
  data,
}) => {
  let body: unknown
  try {
    body = await lerJson(request, 8192)
  } catch {
    return erro('Requisição inválida.', 400)
  }
  const parsed = configInputSchema.safeParse(body)
  if (!parsed.success) {
    const i = parsed.error.issues[0]
    return erro(i?.message ?? 'Dados inválidos.', 422, { campo: i?.path.join('.') })
  }
  await atualizarConfig(env, data.sessao.tenantId, parsed.data)
  return json({ ok: true })
}
