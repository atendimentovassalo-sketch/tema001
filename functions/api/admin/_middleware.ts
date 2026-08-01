/* Portão de autenticação para todas as rotas /api/admin/*.
 * Injeta a sessão em ctx.data para os handlers. */
import type { Env } from '../../_lib/types'
import type { SessaoUsuario } from '../../_lib/db'
import { getSessaoComUsuario } from '../../_lib/db'
import { lerTokenSessao } from '../../_lib/auth'
import { erro } from '../../_lib/http'

export type AdminData = { sessao: SessaoUsuario } & Record<string, unknown>

export const onRequest: PagesFunction<Env, string, AdminData> = async (ctx) => {
  const token = lerTokenSessao(ctx.request)
  const sessao = token ? await getSessaoComUsuario(ctx.env, token) : null
  if (!sessao) return erro('Não autenticado.', 401)
  ctx.data.sessao = sessao
  return ctx.next()
}
