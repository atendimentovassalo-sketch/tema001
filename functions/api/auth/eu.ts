/* GET /api/auth/eu — usuário da sessão atual (para o front saber se está logado). */
import type { Env } from '../../_lib/types'
import { getSessaoComUsuario } from '../../_lib/db'
import { lerTokenSessao } from '../../_lib/auth'
import { json } from '../../_lib/http'

export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  const token = lerTokenSessao(request)
  const sessao = token ? await getSessaoComUsuario(env, token) : null
  if (!sessao) return json({ autenticado: false }, 200)
  return json({
    autenticado: true,
    usuario: { nome: sessao.nome, email: sessao.email, papel: sessao.papel },
  })
}
