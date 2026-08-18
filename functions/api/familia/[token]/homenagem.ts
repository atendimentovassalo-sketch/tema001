/* POST /api/familia/:token/homenagem -> { id, ocultar: boolean }
 *
 * A família oculta ou reexibe uma homenagem publicada no memorial de quem é
 * dela. NUNCA apaga: `status = 'oculta'`, conforme a regra do projeto de não
 * destruir o que alguém escreveu em homenagem a um morto. Dá para voltar atrás.
 */
import { z } from 'zod'
import type { Env } from '../../../_lib/types'
import { getAcessoFamilia, ocultarHomenagemPelaFamilia } from '../../../_lib/db'
import { json, erro, lerJson } from '../../../_lib/http'

const schema = z.object({
  id: z.string().trim().min(1).max(60),
  ocultar: z.boolean(),
})

export const onRequestPost: PagesFunction<Env> = async ({ env, request, params }) => {
  const acesso = await getAcessoFamilia(env, String(params.token))
  if (!acesso) return erro('Link inválido ou vencido.', 404)

  let body: unknown
  try {
    body = await lerJson(request, 4096)
  } catch {
    return erro('Requisição inválida.', 400)
  }
  const parsed = schema.safeParse(body)
  if (!parsed.success) return erro('Dados inválidos.', 422)

  const ok = await ocultarHomenagemPelaFamilia(
    env,
    acesso.memorialId,
    parsed.data.id,
    parsed.data.ocultar,
  )
  if (!ok) return erro('Homenagem não encontrada.', 404)
  return json({ ok: true })
}
