/* GET /api/publico/:cidade — índice cross-tenant da cidade.
 *
 * Neutro: a marca é do guarda-chuva. Cada nota carrega a funerária que a
 * informou, para o card ao lado do nome (o clique que vira lead).
 *
 * Query: ?limite=N&offset=N
 *
 * Cidade desconhecida devolve 404 de verdade — não página vazia. Sem isso a
 * rota catch-all `/<cidade>` geraria URLs infinitas e derrubaria o domínio na
 * busca, que é o oposto do objetivo.
 */
import type { Env } from '../../../_lib/types'
import { getCidadePorSlug, listIndiceCidade } from '../../../_lib/umbrella'
import { json, erro } from '../../../_lib/http'

export const onRequestGet: PagesFunction<Env, 'cidade'> = async ({
  env,
  params,
  request,
}) => {
  const slug = String(params.cidade).toLowerCase()
  const cidade = await getCidadePorSlug(env, slug)
  if (!cidade) return erro('Cidade não encontrada.', 404)

  const url = new URL(request.url)
  const limite = Number(url.searchParams.get('limite')) || 60
  const offset = Number(url.searchParams.get('offset')) || 0

  return json(await listIndiceCidade(env, cidade, { limite, offset }))
}
