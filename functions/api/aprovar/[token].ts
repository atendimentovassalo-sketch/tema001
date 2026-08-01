/* Aprovação de homenagem via link (WhatsApp da família).
 * GET  /api/aprovar/:token  -> dados da homenagem pendente
 * POST /api/aprovar/:token  -> { acao: 'aprovar' | 'recusar' } */
import { z } from 'zod'
import type { Env } from '../../_lib/types'
import {
  getHomenagemPorToken,
  getMemorialNomeSlug,
  definirStatusHomenagem,
} from '../../_lib/db'
import { json, erro, lerJson } from '../../_lib/http'

export const onRequestGet: PagesFunction<Env, 'token'> = async ({
  env,
  params,
}) => {
  const token = String(params.token)
  const h = await getHomenagemPorToken(env, token)
  if (!h) return erro('Link inválido ou já utilizado.', 404)
  const mem = await getMemorialNomeSlug(env, h.memorial_id)
  return json({
    homenagem: {
      id: h.id,
      nome: h.nome,
      texto: h.texto,
      vela: !!h.vela,
      criadoEmISO: h.criado_em,
      status: h.status,
    },
    memorial: mem
      ? { nomeCompleto: mem.nome_completo, slug: mem.slug }
      : null,
  })
}

const acaoSchema = z.object({
  acao: z.enum(['aprovar', 'recusar']),
})

export const onRequestPost: PagesFunction<Env, 'token'> = async ({
  env,
  params,
  request,
}) => {
  const token = String(params.token)
  const h = await getHomenagemPorToken(env, token)
  if (!h) return erro('Link inválido ou já utilizado.', 404)

  let body: unknown
  try {
    body = await lerJson(request)
  } catch {
    return erro('Requisição inválida.', 400)
  }
  const parsed = acaoSchema.safeParse(body)
  if (!parsed.success) return erro('Ação inválida.', 422)

  const novo = parsed.data.acao === 'aprovar' ? 'aprovada' : 'recusada'
  await definirStatusHomenagem(env, h.id, novo)
  return json({ ok: true, status: novo })
}
