/* POST /api/admin/financeiro/mensalidades -> { competencia: 'AAAA-MM' }
 * Gera as mensalidades do mês para todo plano ativo.
 *
 * Repetível de propósito: o índice único parcial da migration 0008 recusa a
 * segunda geração do mesmo mês para o mesmo cliente. Clicar duas vezes devolve
 * `criados: 0`, não cobrança dobrada — a garantia é do banco, não da memória de
 * quem escreveu o código. */
import type { Env } from '../../../_lib/types'
import type { AdminData } from '../_middleware'
import { gerarMensalidades } from '../../../_lib/db'
import { competenciaSchema } from '../../../_lib/schemas'
import { json, erro, lerJson } from '../../../_lib/http'

export const onRequestPost: PagesFunction<Env, string, AdminData> = async ({
  env,
  request,
  data,
}) => {
  let body: unknown
  try {
    body = await lerJson(request, 2048)
  } catch {
    return erro('Requisição inválida.', 400)
  }
  const parsed = competenciaSchema.safeParse(
    (body as { competencia?: unknown } | null)?.competencia,
  )
  if (!parsed.success) return erro('Competência inválida.', 422)

  const criados = await gerarMensalidades(env, data.sessao.tenantId, parsed.data)
  return json({ ok: true, criados })
}
