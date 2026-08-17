/* GET  /api/admin/financeiro?competencia=AAAA-MM
 *      -> resumo do mês + lançamentos do mês + tudo que está em aberto
 *         (de qualquer mês, vencido primeiro — é a pergunta real da dona:
 *          "quem não pagou?", que não respeita fronteira de competência).
 * POST /api/admin/financeiro -> novo lançamento */
import type { Env } from '../../../_lib/types'
import type { AdminData } from '../_middleware'
import {
  listLancamentos,
  listEmAberto,
  inserirLancamento,
  getResumoFinanceiro,
} from '../../../_lib/db'
import { lancamentoInputSchema, competenciaSchema } from '../../../_lib/schemas'
import { json, erro, lerJson } from '../../../_lib/http'

/** Mês corrente em 'AAAA-MM'. Fuso de São Paulo: no Worker o relógio é UTC, e
 *  entre 21h e 0h (BRT) o dia 31 em UTC já é o mês seguinte — isso jogaria um
 *  lançamento de fim de mês para a competência errada. */
function competenciaAtual(): string {
  const agora = new Date()
  const brt = new Date(agora.getTime() - 3 * 3600 * 1000)
  return `${brt.getUTCFullYear()}-${String(brt.getUTCMonth() + 1).padStart(2, '0')}`
}

export const onRequestGet: PagesFunction<Env, string, AdminData> = async ({
  env,
  request,
  data,
}) => {
  const bruto = new URL(request.url).searchParams.get('competencia')
  const parsed = bruto ? competenciaSchema.safeParse(bruto) : null
  if (bruto && !parsed?.success) return erro('Competência inválida.', 422)
  const competencia = parsed?.success ? parsed.data : competenciaAtual()

  const tenantId = data.sessao.tenantId
  const [resumo, lancamentos, emAberto] = await Promise.all([
    getResumoFinanceiro(env, tenantId, competencia),
    listLancamentos(env, tenantId, competencia),
    listEmAberto(env, tenantId),
  ])
  return json({ competencia, resumo, lancamentos, emAberto })
}

export const onRequestPost: PagesFunction<Env, string, AdminData> = async ({
  env,
  request,
  data,
}) => {
  let body: unknown
  try {
    body = await lerJson(request, 16_384)
  } catch {
    return erro('Requisição inválida.', 400)
  }
  const parsed = lancamentoInputSchema.safeParse(body)
  if (!parsed.success) {
    const i = parsed.error.issues[0]
    return erro(i?.message ?? 'Dados inválidos.', 422, { campo: i?.path.join('.') })
  }
  const id = await inserirLancamento(env, data.sessao.tenantId, parsed.data)
  return json({ ok: true, id }, 201)
}
