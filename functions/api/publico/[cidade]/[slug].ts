/* GET /api/publico/:cidade/:slug — a nota individual do guarda-chuva.
 *
 * White-label: a funerária devolvida é a DONA DA NOTA, resolvida pelo
 * `tenant_id` do memorial — nunca pelo host da requisição. É o que permite
 * servir São Francisco e qualquer outra funerária no mesmo domínio.
 *
 * Devolve também `outras`: as demais notas da cidade, para o bloco de rodapé
 * (decisão D4), que é a única ponte da nota para o índice depois que a moldura
 * ficou sem fita.
 */
import type { Env } from '../../../_lib/types'
import {
  getNotaPorCidadeSlug,
  listOutrasNotasDaCidade,
} from '../../../_lib/umbrella'
import { incrementarVisitas } from '../../../_lib/db'
import { json, erro } from '../../../_lib/http'

export const onRequestGet: PagesFunction<Env, 'cidade' | 'slug'> = async ({
  env,
  params,
  waitUntil,
}) => {
  const cidadeSlug = String(params.cidade).toLowerCase()
  const notaSlug = String(params.slug).toLowerCase()

  const memorial = await getNotaPorCidadeSlug(env, cidadeSlug, notaSlug)
  if (!memorial) return erro('Nota não encontrada.', 404)

  // contagem de visita é best-effort: não pode atrasar nem derrubar a página
  waitUntil(incrementarVisitas(env, memorial.id).catch(() => {}))

  const outras = await listOutrasNotasDaCidade(env, cidadeSlug, notaSlug, 6)
  return json({ memorial, outras })
}
