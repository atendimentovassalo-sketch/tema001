/* GET /api/familia/:token  -> o que a família pode ver e editar
 * PUT /api/familia/:token  -> grava a história
 *
 * Rota PÚBLICA por desenho: quem tem o link entra. O token é a credencial, e
 * por isso ele expira (30 dias) e dá acesso a UM memorial e a mais nada — nem a
 * outro falecido, nem ao painel, nem a qualquer dado financeiro.
 *
 * Decidido em 12/08/2026, construído em 18/08/2026.
 */
import { z } from 'zod'
import type { Env } from '../../../_lib/types'
import {
  getAcessoFamilia,
  atualizarHistoriaPelaFamilia,
  listHomenagensDoMemorial,
  listFotosDoMemorial,
} from '../../../_lib/db'
import { json, erro, lerJson } from '../../../_lib/http'

const MAX_FOTOS = 12

const historiaSchema = z.object({
  historia: z.string().trim().max(8000).nullable().default(null),
})

export const onRequestGet: PagesFunction<Env> = async ({ env, params }) => {
  const acesso = await getAcessoFamilia(env, String(params.token))
  /* 404 e não 403: para quem chuta token, "existe mas você não pode" já é
   * informação. Vencido e inexistente respondem igual. */
  if (!acesso) return erro('Link inválido ou vencido.', 404)

  const [homenagens, fotos] = await Promise.all([
    listHomenagensDoMemorial(env, acesso.memorialId),
    listFotosDoMemorial(env, acesso.memorialId),
  ])

  return json({
    memorial: {
      nomeCompleto: acesso.nomeCompleto,
      slug: acesso.slug,
      historia: acesso.historia,
    },
    homenagens,
    fotos,
    maxFotos: MAX_FOTOS,
    expiraEm: acesso.expira,
  })
}

export const onRequestPut: PagesFunction<Env> = async ({ env, request, params }) => {
  const acesso = await getAcessoFamilia(env, String(params.token))
  if (!acesso) return erro('Link inválido ou vencido.', 404)

  let body: unknown
  try {
    body = await lerJson(request, 32_768)
  } catch {
    return erro('Requisição inválida.', 400)
  }
  const parsed = historiaSchema.safeParse(body)
  if (!parsed.success) return erro('Texto grande demais.', 422)

  await atualizarHistoriaPelaFamilia(
    env,
    acesso.memorialId,
    parsed.data.historia?.trim() || null,
  )
  return json({ ok: true })
}
