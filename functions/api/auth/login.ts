/* POST /api/auth/login — { email, senha } -> cria sessão (cookie httpOnly). */
import { z } from 'zod'
import type { Env } from '../../_lib/types'
import {
  getUsuarioPorEmail,
  inserirSessao,
  registrarAcesso,
  contarFalhasLoginRecentes,
  registrarFalhaLogin,
  limparFalhasLogin,
} from '../../_lib/db'
import {
  verificarSenha,
  novoTokenSessao,
  ttlHoras,
  cookieSessao,
  requisicaoSegura,
} from '../../_lib/auth'
import { json, erro, lerJson, ipHash, sha256Hex } from '../../_lib/http'

const schema = z.object({
  email: z.string().trim().email().max(160),
  senha: z.string().min(1).max(200),
})

/* Rate-limit de força bruta: 5 falhas por par (IP, e-mail) a cada 15 minutos.
   A chave é o PAR, de propósito. Só por e-mail, qualquer pessoa tranca a dona da
   funerária de fora errando a senha dela — o lockout viraria a negação de serviço.
   Só por IP, um atacante varre e-mails à vontade dentro da cota. */
const JANELA_SEGUNDOS = 15 * 60
const MAX_FALHAS = 5

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  let body: unknown
  try {
    body = await lerJson(request)
  } catch {
    return erro('Requisição inválida.', 400)
  }
  const parsed = schema.safeParse(body)
  if (!parsed.success) return erro('Informe e-mail e senha.', 422)

  // Chave do rate-limit. Nem IP nem e-mail entram em claro no banco: o ipHash já
  // é o helper usado no rate-limit de homenagens, e o e-mail recebe o mesmo
  // tratamento para esta tabela não virar um registro dos e-mails chutados.
  const ip = await ipHash(request)
  const emailChave = ip
    ? await sha256Hex(`login:${parsed.data.email.toLowerCase()}`)
    : null

  if (ip && emailChave) {
    // Falha-aberto de propósito: se a contagem quebrar, o login continua
    // funcionando. Isto é o painel de uma funerária de plantão — trancar a dona
    // fora às 3h da manhã por causa de um erro de banco é pior que a força bruta
    // que a senha derivada por PBKDF2 já encarece.
    try {
      const falhas = await contarFalhasLoginRecentes(env, ip, emailChave, JANELA_SEGUNDOS)
      if (falhas >= MAX_FALHAS)
        return erro('Muitas tentativas. Aguarde alguns minutos e tente de novo.', 429)
    } catch {
      /* segue o fluxo normal de autenticação */
    }
  }

  const u = await getUsuarioPorEmail(env, parsed.data.email)
  const ok = u && (await verificarSenha(parsed.data.senha, u.senha_hash, u.senha_salt))
  if (!u || !ok) {
    if (ip && emailChave) {
      try {
        await registrarFalhaLogin(env, ip, emailChave)
      } catch {
        /* não transformar falha de log em erro 500 para quem só errou a senha */
      }
    }
    // mensagem genérica: não revela se o e-mail existe
    return erro('E-mail ou senha incorretos.', 401)
  }

  // acertou: zera o histórico, para que errar 4 vezes hoje e acertar não deixe
  // a conta a um erro do bloqueio amanhã.
  if (ip && emailChave) {
    try {
      await limparFalhasLogin(env, ip, emailChave)
    } catch {
      /* irrelevante para o sucesso do login */
    }
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
