/* GET/POST /api/admin/usuarios — quem tem acesso ao painel da funerária.
 * POST cria a pessoa já com convite de 1º acesso: nós nunca digitamos a senha
 * de ninguém, ela é definida pelo próprio convidado. */
import type { Env } from '../../../_lib/types'
import type { AdminData } from '../_middleware'
import {
  listUsuarios,
  emailEmUso,
  criarUsuario,
  getTenantPorId,
} from '../../../_lib/db'
import { usuarioNovoSchema } from '../../../_lib/schemas'
import { enviarEmail, emailConvite } from '../../../_lib/email'
import { json, erro, lerJson, tokenAleatorio } from '../../../_lib/http'

const DIAS_CONVITE = 7

export const onRequestGet: PagesFunction<Env, string, AdminData> = async ({
  env,
  data,
}) => {
  const usuarios = await listUsuarios(env, data.sessao.tenantId)
  return json({ usuarios, euId: data.sessao.usuarioId })
}

export const onRequestPost: PagesFunction<Env, string, AdminData> = async ({
  env,
  request,
  data,
  waitUntil,
}) => {
  if (data.sessao.papel !== 'admin')
    return erro('Apenas administradores podem gerenciar usuários.', 403)

  let body: unknown
  try {
    body = await lerJson(request, 4096)
  } catch {
    return erro('Requisição inválida.', 400)
  }
  const parsed = usuarioNovoSchema.safeParse(body)
  if (!parsed.success) {
    const i = parsed.error.issues[0]
    return erro(i?.message ?? 'Dados inválidos.', 422, { campo: i?.path.join('.') })
  }
  const { nome, email, papel } = parsed.data

  if (await emailEmUso(env, email)) {
    return erro('Já existe alguém com esse e-mail.', 409, { campo: 'email' })
  }

  const token = tokenAleatorio()
  const expira = new Date(Date.now() + DIAS_CONVITE * 86_400_000).toISOString()
  await criarUsuario(env, {
    id: crypto.randomUUID(),
    tenantId: data.sessao.tenantId,
    nome,
    email,
    papel,
    conviteToken: token,
    conviteExpiraISO: expira,
  })

  const tenant = await getTenantPorId(env, data.sessao.tenantId)
  const link = `${new URL(request.url).origin}/admin/login?convite=${token}`
  const msg = emailConvite(tenant?.nome ?? 'sua funerária', nome, link)
  waitUntil(
    enviarEmail(env, { para: email, assunto: msg.assunto, html: msg.html, texto: msg.texto }),
  )

  // devolve o link também: se o e-mail não chegar, dá para mandar por WhatsApp
  return json({ ok: true, link }, 201)
}
