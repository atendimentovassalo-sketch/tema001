/* POST /api/auth/login — { email, senha } -> cria sessão (cookie httpOnly). */
import { z } from 'zod'
import type { Env } from '../../_lib/types'
import {
  getUsuarioPorEmail,
  inserirSessao,
  registrarAcesso,
  registrarTentativaAuth,
  contarTentativasAuthRecentes,
} from '../../_lib/db'
import {
  verificarSenha,
  novoTokenSessao,
  ttlHoras,
  cookieSessao,
  requisicaoSegura,
} from '../../_lib/auth'
import { json, erro, lerJson, ipHash } from '../../_lib/http'

// Hash/salt fictícios (hex válido) só para gastar o mesmo tempo de PBKDF2
// quando o e-mail não existe — impede enumeração de usuários por timing.
const HASH_DUMMY = '0'.repeat(64)
const SALT_DUMMY = '0'.repeat(32)
const MAX_TENTATIVAS = 10
const JANELA_SEG = 900 // 15 min

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

  // rate-limit por IP: trava força-bruta/credential-stuffing
  const ip = await ipHash(request)
  if (ip) {
    const recentes = await contarTentativasAuthRecentes(env, ip, 'login', JANELA_SEG)
    if (recentes >= MAX_TENTATIVAS)
      return erro('Muitas tentativas. Tente novamente em alguns minutos.', 429)
  }

  const u = await getUsuarioPorEmail(env, parsed.data.email)
  // roda PBKDF2 sempre (real ou dummy) para não vazar existência do e-mail por timing
  const ok = u
    ? await verificarSenha(parsed.data.senha, u.senha_hash, u.senha_salt)
    : (await verificarSenha(parsed.data.senha, HASH_DUMMY, SALT_DUMMY), false)
  if (!u || !ok) {
    if (ip) await registrarTentativaAuth(env, ip, 'login')
    // mensagem genérica: não revela se o e-mail existe
    return erro('E-mail ou senha incorretos.', 401)
  }

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
