/* PUT/DELETE /api/admin/usuarios/:id — editar, ativar/desativar, reenviar
 * convite e remover. Ninguém consegue desativar nem apagar a si mesmo: isso
 * deixaria a funerária sem acesso ao painel. */
import type { Env } from '../../../_lib/types'
import type { AdminData } from '../_middleware'
import {
  getUsuarioDoTenant,
  getTenantPorId,
  atualizarUsuario,
  setAtivoUsuario,
  deletarUsuario,
  definirConviteRecuperacao,
} from '../../../_lib/db'
import { usuarioEditarSchema } from '../../../_lib/schemas'
import { enviarEmail, emailConvite } from '../../../_lib/email'
import { json, erro, lerJson, tokenAleatorio } from '../../../_lib/http'

const DIAS_CONVITE = 7

export const onRequestPut: PagesFunction<Env, string, AdminData> = async ({
  env,
  request,
  params,
  data,
  waitUntil,
}) => {
  if (data.sessao.papel !== 'admin')
    return erro('Apenas administradores podem gerenciar usuários.', 403)
  const id = String(params.id)
  const alvo = await getUsuarioDoTenant(env, data.sessao.tenantId, id)
  if (!alvo) return erro('Usuário não encontrado.', 404)

  let body: unknown
  try {
    body = await lerJson(request, 4096)
  } catch {
    return erro('Requisição inválida.', 400)
  }
  const parsed = usuarioEditarSchema.safeParse(body)
  if (!parsed.success) {
    const i = parsed.error.issues[0]
    return erro(i?.message ?? 'Dados inválidos.', 422, { campo: i?.path.join('.') })
  }
  const p = parsed.data

  if (p.ativo === false && id === data.sessao.usuarioId) {
    return erro('Você não pode desativar o seu próprio acesso.', 409)
  }

  if (p.nome !== undefined || p.papel !== undefined) {
    await atualizarUsuario(env, id, {
      nome: p.nome ?? alvo.nome,
      papel: p.papel ?? alvo.papel,
    })
  }
  if (p.ativo !== undefined) await setAtivoUsuario(env, id, p.ativo)

  let link: string | undefined
  if (p.reenviarConvite) {
    const token = tokenAleatorio()
    const expira = new Date(Date.now() + DIAS_CONVITE * 86_400_000).toISOString()
    await definirConviteRecuperacao(env, id, token, expira)
    link = `${new URL(request.url).origin}/admin/login?convite=${token}`
    const tenant = await getTenantPorId(env, data.sessao.tenantId)
    const msg = emailConvite(tenant?.nome ?? 'sua funerária', alvo.nome, link)
    waitUntil(
      enviarEmail(env, {
        para: alvo.email,
        assunto: msg.assunto,
        html: msg.html,
        texto: msg.texto,
      }),
    )
  }

  return json({ ok: true, ...(link ? { link } : {}) })
}

export const onRequestDelete: PagesFunction<Env, string, AdminData> = async ({
  env,
  params,
  data,
}) => {
  if (data.sessao.papel !== 'admin')
    return erro('Apenas administradores podem gerenciar usuários.', 403)
  const id = String(params.id)
  if (id === data.sessao.usuarioId) {
    return erro('Você não pode remover o seu próprio acesso.', 409)
  }
  const alvo = await getUsuarioDoTenant(env, data.sessao.tenantId, id)
  if (!alvo) return erro('Usuário não encontrado.', 404)
  await deletarUsuario(env, id)
  return json({ ok: true })
}
