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

   A CONTAGEM VEM DEPOIS DA CONFERÊNCIA DA SENHA, não antes — e isso é a decisão
   central deste arquivo. Quem digita a senha certa entra sempre, mesmo estourada
   a cota; só tentativa ERRADA é contada e bloqueada.

   Motivo, verificado ao vivo em 17/08/2026: pelo domínio do cliente as
   requisições passam pelo Worker `proxy-obituario`, que NÃO repassa o IP do
   visitante (o ip_hash gravado por esse caminho difere do que chega direto no
   `pages.dev`, da mesma máquina). Ou seja, no domínio que importa o componente
   de IP é praticamente o mesmo para todo mundo. Com a checagem antes da senha,
   qualquer pessoa que soubesse o e-mail da dona da funerária trancaria o painel
   dela por 15 minutos errando 5 senhas de propósito — numa operação de plantão
   24h, isso é pior que o ataque que se quer impedir.

   O que se perde: a checagem tardia não poupa a CPU do PBKDF2 numa enxurrada de
   tentativas. É troca consciente — aqui o objetivo é impedir adivinhação de
   senha sem criar um botão de derrubar a cliente. Se um dia a CPU virar
   problema, o caminho é um teto grosseiro por IP ANTES da senha, sem mexer neste. */
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

  const u = await getUsuarioPorEmail(env, parsed.data.email)
  const ok = u && (await verificarSenha(parsed.data.senha, u.senha_hash, u.senha_salt))

  if (!u || !ok) {
    // Falha-aberto de propósito em todo este bloco: se a contagem quebrar, quem
    // errou a senha só recebe o 401 de sempre. Erro de banco não vira erro 500
    // na tela de quem está tentando entrar.
    if (ip && emailChave) {
      try {
        await registrarFalhaLogin(env, ip, emailChave)
        const falhas = await contarFalhasLoginRecentes(env, ip, emailChave, JANELA_SEGUNDOS)
        if (falhas > MAX_FALHAS)
          return erro('Muitas tentativas. Aguarde alguns minutos e tente de novo.', 429)
      } catch {
        /* segue com o 401 genérico */
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
