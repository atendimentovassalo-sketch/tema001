/* POST /api/auth/recuperar — { email }. Gera um link de redefinição (válido
 * 1h) e envia por e-mail. Resposta sempre neutra (não revela se o e-mail
 * existe). O link reaproveita o fluxo de definir-senha. */
import { z } from 'zod'
import type { Env } from '../../_lib/types'
import {
  getUsuarioPorEmail,
  getTenantPorId,
  definirConviteRecuperacao,
} from '../../_lib/db'
import { enviarEmail, emailRecuperacao } from '../../_lib/email'
import { json, erro, lerJson, tokenAleatorio } from '../../_lib/http'

const schema = z.object({ email: z.string().trim().email().max(160) })

export const onRequestPost: PagesFunction<Env> = async ({
  env,
  request,
  waitUntil,
}) => {
  let body: unknown
  try {
    body = await lerJson(request)
  } catch {
    return erro('Requisição inválida.', 400)
  }
  const parsed = schema.safeParse(body)
  // resposta sempre neutra (anti-enumeração de e-mails)
  const neutra = json({ ok: true })
  if (!parsed.success) return neutra

  const u = await getUsuarioPorEmail(env, parsed.data.email)
  if (!u) return neutra

  const token = tokenAleatorio()
  const expira = new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hora
  await definirConviteRecuperacao(env, u.id, token, expira)

  const tenant = await getTenantPorId(env, u.tenant_id)
  const origin = new URL(request.url).origin
  const link = `${origin}/admin/login?convite=${token}`
  const email = emailRecuperacao(tenant?.nome ?? 'sua funerária', link)
  // envio não bloqueia a resposta
  waitUntil(
    enviarEmail(env, {
      para: u.email,
      assunto: email.assunto,
      html: email.html,
      texto: email.texto,
    }),
  )

  return neutra
}
