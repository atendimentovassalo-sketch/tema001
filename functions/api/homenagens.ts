/* POST /api/homenagens — registra uma homenagem (mensagem e/ou vela).
 * Fluxo público: honeypot, validação, rate-limit por IP, moderação opcional. */
import { z } from 'zod'
import type { Env, HomenagemDTO } from './../_lib/types'
import {
  getTenantPorHost,
  getMemorialBasico,
  contarHomenagensRecentesPorIp,
  inserirHomenagem,
} from './../_lib/db'
import { json, erro, lerJson, tokenAleatorio, ipHash } from './../_lib/http'

const schema = z
  .object({
    memorialSlug: z.string().trim().min(1).max(120),
    nome: z.string().trim().min(1, 'Diga como você quer assinar.').max(80),
    texto: z.string().trim().max(600, 'Máximo de 600 caracteres.').optional().default(''),
    vela: z.boolean().optional().default(true),
    /* Desenho da vela. Texto livre curto: a tela valida a lista, e um id
     * desconhecido cai no desenho padrão em vez de quebrar a página. */
    velaTipo: z.string().trim().max(24).nullable().optional().default(null),
    // honeypot anti-spam: humano não preenche
    website: z.string().max(0).optional().default(''),
  })
  .refine((d) => d.vela || d.texto.trim().length > 0, {
    message: 'Escreva uma mensagem ou marque a vela.',
    path: ['texto'],
  })

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  const tenant = await getTenantPorHost(env, request)
  if (!tenant) return erro('Funerária não configurada.', 503)

  let body: unknown
  try {
    body = await lerJson(request)
  } catch {
    return erro('Requisição inválida.', 400)
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    const primeiro = parsed.error.issues[0]
    return erro(primeiro?.message ?? 'Dados inválidos.', 422, {
      campo: primeiro?.path.join('.'),
    })
  }
  const dados = parsed.data

  // honeypot: bot detectado — responde sucesso sem gravar
  if (dados.website) return json({ ok: true, ignorado: true })

  const memorial = await getMemorialBasico(env, tenant.id, dados.memorialSlug)
  if (!memorial) return erro('Memorial não encontrado.', 404)

  // rate-limit: no máximo 5 homenagens por IP por minuto
  const ip = await ipHash(request, env)
  if (ip) {
    const recentes = await contarHomenagensRecentesPorIp(env, ip, 60)
    if (recentes >= 5)
      return erro('Muitas mensagens em pouco tempo. Aguarde um instante.', 429)
  }

  const texto = dados.texto.trim() || null
  // vela nunca depende de aprovação; mensagem depende quando a família modera
  const status: 'pendente' | 'aprovada' =
    texto && memorial.moderar ? 'pendente' : 'aprovada'
  const aprovarToken = status === 'pendente' ? tokenAleatorio() : null

  const id = crypto.randomUUID()
  await inserirHomenagem(env, id, {
    memorialId: memorial.id,
    tenantId: tenant.id,
    nome: dados.nome.trim(),
    texto,
    vela: dados.vela,
    velaTipo: dados.vela ? (dados.velaTipo ?? null) : null,
    status,
    aprovarToken,
    ipHash: ip,
  })

  const criada: HomenagemDTO = {
    id,
    nome: dados.nome.trim(),
    texto,
    vela: dados.vela,
    velaTipo: dados.vela ? (dados.velaTipo ?? null) : null,
    criadoEmISO: new Date().toISOString(),
    status,
  }
  // homenagem só entra no feed público na hora se aprovada; vela sempre conta
  return json({ ok: true, homenagem: criada, moderada: status === 'pendente' })
}
