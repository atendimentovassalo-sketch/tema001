/* GET /api/memoriais/:slug — memorial público por slug (+1 visita). */
import type { Env } from '../../_lib/types'
import { getTenantPorHost, getMemorialPublico, incrementarVisitas } from '../../_lib/db'
import { json, erro } from '../../_lib/http'

export const onRequestGet: PagesFunction<Env, 'slug'> = async ({
  env,
  params,
  waitUntil,
  request,
}) => {
  const tenant = await getTenantPorHost(env, request)
  if (!tenant) return erro('Funerária não configurada.', 503)

  const slug = String(params.slug)
  const memorial = await getMemorialPublico(env, tenant, slug)
  if (!memorial) return erro('Memorial não encontrado.', 404)

  // contagem de visita não bloqueia a resposta
  waitUntil(incrementarVisitas(env, memorial.id))

  return json({ memorial })
}
