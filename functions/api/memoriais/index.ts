/* GET /api/memoriais — lista pública de publicados do tenant.
 * Query: ?limite=N&excluir=slug */
import type { Env } from '../../_lib/types'
import { getTenantPorHost, listPublicados, toFunerariaDTO } from '../../_lib/db'
import { json, erro } from '../../_lib/http'

export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  const tenant = await getTenantPorHost(env, request)
  if (!tenant) return erro('Funerária não configurada.', 503)

  const url = new URL(request.url)
  const limite = Math.min(Math.max(Number(url.searchParams.get('limite')) || 60, 1), 500)
  const excluir = url.searchParams.get('excluir') ?? undefined

  const memoriais = await listPublicados(env, tenant, { limite, excluir })
  return json({ funeraria: toFunerariaDTO(tenant), memoriais })
}
