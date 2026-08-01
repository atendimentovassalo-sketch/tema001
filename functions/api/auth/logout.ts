/* POST /api/auth/logout — encerra a sessão atual. */
import type { Env } from '../../_lib/types'
import { deletarSessao } from '../../_lib/db'
import { cookieLimpar, lerTokenSessao, requisicaoSegura } from '../../_lib/auth'
import { json } from '../../_lib/http'

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  const token = lerTokenSessao(request)
  if (token) await deletarSessao(env, token)
  return json({ ok: true }, 200, {
    'set-cookie': cookieLimpar(requisicaoSegura(request)),
  })
}
