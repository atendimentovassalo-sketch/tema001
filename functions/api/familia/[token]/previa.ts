/* GET /api/familia/:token/previa -> a nota inteira, como ela vai ao ar.
 *
 * POR QUE EXISTE (18/08/2026): a família precisa ver a página ANTES de ela ir
 * ao ar — e até aqui só via depois. O link "ver como as pessoas veem" apontava
 * para /m/:slug, que só serve memorial publicado; num rascunho dava "não
 * encontrado", justo para quem estava escrevendo a história.
 *
 * O acesso é o mesmo do resto da área da família: o token. Ele já vale para
 * EDITAR este memorial, então ler o rascunho não amplia poder nenhum — e
 * continua limitado a esta nota, sem tocar em painel, dinheiro ou outro
 * falecido. Reaproveita `getMemorialAdmin`, que é a mesma montagem que a
 * funerária vê na prévia dela; o que muda é só quem tem direito de pedir.
 */
import type { Env } from '../../../_lib/types'
import {
  getAcessoFamilia,
  getTenantPorId,
  getMemorialAdmin,
} from '../../../_lib/db'
import { json, erro } from '../../../_lib/http'

export const onRequestGet: PagesFunction<Env> = async ({ env, params }) => {
  const acesso = await getAcessoFamilia(env, String(params.token))
  /* 404 e não 403, como no resto da área: para quem chuta token, "existe mas
   * você não pode" já é informação. */
  if (!acesso) return erro('Link inválido ou vencido.', 404)

  const tenant = await getTenantPorId(env, acesso.tenantId)
  if (!tenant) return erro('Funerária não encontrada.', 404)

  const memorial = await getMemorialAdmin(env, tenant, acesso.memorialId)
  if (!memorial) return erro('Memorial não encontrado.', 404)

  /* `status` não faz parte do DTO do memorial (é assunto de bastidor, não da
   * página), mas a faixa da prévia precisa dizer se a nota já está no ar. */
  const linha = await env.DB.prepare(
    'SELECT status FROM memorial WHERE id = ? LIMIT 1',
  )
    .bind(acesso.memorialId)
    .first<{ status: string }>()

  return json({ memorial, publicado: linha?.status === 'publicado' })
}
