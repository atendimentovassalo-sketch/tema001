/* POST /api/auth/definir-senha — { token, senha } -> 1º acesso / redefinição.
 * Valida o convite, grava a senha (PBKDF2) e já cria a sessão. */
import { z } from 'zod'
import type { Env } from '../../_lib/types'
import {
  getUsuarioPorConvite,
  definirSenhaUsuario,
  inserirSessao,
  registrarAcesso,
} from '../../_lib/db'
import {
  hashSenha,
  novoTokenSessao,
  ttlHoras,
  cookieSessao,
  requisicaoSegura,
} from '../../_lib/auth'
import { json, erro, lerJson } from '../../_lib/http'

const schema = z.object({
  token: z.string().trim().min(10).max(200),
  senha: z
    .string()
    .min(8, 'A senha deve ter ao menos 8 caracteres.')
    .max(200),
})

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  let body: unknown
  try {
    body = await lerJson(request)
  } catch {
    return erro('Requisição inválida.', 400)
  }
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return erro(parsed.error.issues[0]?.message ?? 'Dados inválidos.', 422)
  }

  const u = await getUsuarioPorConvite(env, parsed.data.token)
  if (!u) return erro('Convite inválido ou já utilizado.', 400)
  if (u.convite_expira && new Date(u.convite_expira).getTime() < Date.now()) {
    return erro('Convite expirado. Solicite um novo link.', 400)
  }

  const { hash, salt } = await hashSenha(parsed.data.senha)
  await definirSenhaUsuario(env, u.id, hash, salt)

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
