/* PATCH  /api/admin/financeiro/:id -> marca pago (ou reabre, com pagoEm null)
 * DELETE /api/admin/financeiro/:id -> exclui o lançamento
 *
 * Aqui exclusão é exclusão mesmo, ao contrário do cliente: lançamento errado
 * (valor trocado, mês errado) é ruído, não histórico. Manter um lançamento
 * falso "arquivado" contaminaria justamente o total que a tela existe para
 * mostrar. */
import type { Env } from '../../../_lib/types'
import type { AdminData } from '../_middleware'
import { definirPagamento, excluirLancamento } from '../../../_lib/db'
import { pagamentoInputSchema } from '../../../_lib/schemas'
import { json, erro, lerJson } from '../../../_lib/http'

export const onRequestPatch: PagesFunction<Env, string, AdminData> = async ({
  env,
  request,
  params,
  data,
}) => {
  let body: unknown
  try {
    body = await lerJson(request, 4096)
  } catch {
    return erro('Requisição inválida.', 400)
  }
  const parsed = pagamentoInputSchema.safeParse(body)
  if (!parsed.success) {
    const i = parsed.error.issues[0]
    return erro(i?.message ?? 'Dados inválidos.', 422)
  }
  const ok = await definirPagamento(
    env,
    data.sessao.tenantId,
    String(params.id),
    parsed.data.pagoEm,
  )
  if (!ok) return erro('Lançamento não encontrado.', 404)
  return json({ ok: true })
}

export const onRequestDelete: PagesFunction<Env, string, AdminData> = async ({
  env,
  params,
  data,
}) => {
  const ok = await excluirLancamento(env, data.sessao.tenantId, String(params.id))
  if (!ok) return erro('Lançamento não encontrado.', 404)
  return json({ ok: true })
}
