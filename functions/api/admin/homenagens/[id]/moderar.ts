/* POST /api/admin/homenagens/:id/moderar — { acao: 'aprovar' | 'recusar' } */
import { z } from 'zod'
import type { Env } from '../../../../_lib/types'
import type { AdminData } from '../../_middleware'
import { getHomenagemDoTenant, definirStatusHomenagem } from '../../../../_lib/db'
import { json, erro, lerJson } from '../../../../_lib/http'

const schema = z.object({ acao: z.enum(['aprovar', 'recusar']) })

export const onRequestPost: PagesFunction<Env, 'id', AdminData> = async ({
  env,
  request,
  params,
  data,
}) => {
  const h = await getHomenagemDoTenant(env, data.sessao.tenantId, String(params.id))
  if (!h) return erro('Homenagem não encontrada.', 404)

  let body: unknown
  try {
    body = await lerJson(request)
  } catch {
    return erro('Requisição inválida.', 400)
  }
  const parsed = schema.safeParse(body)
  if (!parsed.success) return erro('Ação inválida.', 422)

  const novo = parsed.data.acao === 'aprovar' ? 'aprovada' : 'recusada'
  await definirStatusHomenagem(env, h.id, novo)
  return json({ ok: true, status: novo })
}
