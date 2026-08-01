/* POST /api/auth/login — { email, senha } -> cria sessão (cookie httpOnly). */
import { z } from 'zod'
import type { Env } from '../../_lib/types'
import {
  getUsuarioPorEmail,
  inserirSessao,
  registrarAcesso,
} from '../../_lib/db'
import {
  verificarSenha,
  novoTokenSessao,
  ttlHoras,
  cookieSessao,
  requisicaoSegura,
} from '../../_lib/auth'
import { json, erro, lerJson } from '../../_lib/http'

const schema = z.object({
  email: z.string().trim().email().max(160),
  senha: z.string().min(1).max(200),
})

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  let body: unknown
  try {
    body = await lerJson(request)
  } catch {
    return erro('Requisição inválida.', 400)
  }
  const parsed = schema.safeParse(body)
  if (!parsed.success) return erro('Informe e-mail e senha.', 422)

  const u = await getUsuarioPorEmail(env, parsed.data.email)
  const ok = u && (await verificarSenha(parsed.data.senha, u.senha_hash, u.senha_salt))
  // mensagem genérica: não revela se o e-mail existe
  if (!u || !ok) return erro('E-mail ou senha incorretos.', 401)

  const token = novoTokenSessao()
  const maxAge = ttlHoras(env) * 3600
  const expira = new Date(Date.now() + maxAge * 1000).toISOString()
  await inserirSessao(env, token, u.id, u.tenant_id, expira)
  await registrarAcesso(env, u.id)

  return json(
    { usuario: { nome: u.nome, email: u.email } },
    200,
    { 'set-cookie': cookieSessao(token, maxAge, requisicaoSegura(request)) },
  )
}
