/* POST /api/publico/homenagens — homenagem vinda do guarda-chuva.
 *
 * Corrige o achado (B): a rota antiga (`/api/homenagens`) resolve o tenant por
 * `getTenantPorHost`, que devolve null quando o host não pertence a nenhum
 * tenant — exatamente o caso do guarda-chuva com 2+ tenants. Ali a gravação
 * simplesmente falharia. Aqui o tenant vem da NOTA.
 *
 * Mantém as três defesas que já existem na rota antiga: honeypot, validação e
 * rate-limit por IP.
 */
import { z } from 'zod'
import type { Env, HomenagemDTO } from '../../_lib/types'
import { getNotaBasicaPorCidadeSlug } from '../../_lib/umbrella'
import {
  contarHomenagensRecentesPorIp,
  inserirHomenagem,
} from '../../_lib/db'
import { json, erro, lerJson, tokenAleatorio, ipHash } from '../../_lib/http'

const schema = z
  .object({
    cidade: z.string().trim().min(1).max(120),
    memorialSlug: z.string().trim().min(1).max(120),
    nome: z.string().trim().min(1, 'Diga como você quer assinar.').max(80),
    texto: z
      .string()
      .trim()
      .max(600, 'Máximo de 600 caracteres.')
      .optional()
      .default(''),
    vela: z.boolean().optional().default(true),
    // honeypot anti-spam: humano não preenche
    website: z.string().max(0).optional().default(''),
  })
  .refine((d) => d.vela || d.texto.trim().length > 0, {
    message: 'Escreva uma mensagem ou marque a vela.',
    path: ['texto'],
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
    const primeiro = parsed.error.issues[0]
    return erro(primeiro?.message ?? 'Dados inválidos.', 422, {
      campo: primeiro?.path.join('.'),
    })
  }
  const dados = parsed.data

  // honeypot: bot detectado — responde sucesso sem gravar
  if (dados.website) return json({ ok: true, ignorado: true })

  const nota = await getNotaBasicaPorCidadeSlug(
    env,
    dados.cidade.toLowerCase(),
    dados.memorialSlug.toLowerCase(),
  )
  if (!nota) return erro('Nota não encontrada.', 404)

  const ip = await ipHash(request)
  if (ip) {
    const recentes = await contarHomenagensRecentesPorIp(env, ip, 60)
    if (recentes >= 5)
      return erro('Muitas mensagens em pouco tempo. Aguarde um instante.', 429)
  }

  const texto = dados.texto.trim() || null
  // vela nunca depende de aprovação; mensagem depende quando a nota é moderada
  const status: 'pendente' | 'aprovada' =
    texto && nota.moderar ? 'pendente' : 'aprovada'
  const aprovarToken = status === 'pendente' ? tokenAleatorio() : null

  const id = crypto.randomUUID()
  await inserirHomenagem(env, id, {
    memorialId: nota.id,
    tenantId: nota.tenantId, // <- da NOTA, não do host
    nome: dados.nome.trim(),
    texto,
    vela: dados.vela,
    status,
    aprovarToken,
    ipHash: ip,
  })

  const criada: HomenagemDTO = {
    id,
    nome: dados.nome.trim(),
    texto,
    vela: dados.vela,
    criadoEmISO: new Date().toISOString(),
    status,
  }
  return json({ ok: true, homenagem: criada, moderada: status === 'pendente' })
}
