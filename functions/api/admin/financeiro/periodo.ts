/* GET /api/admin/financeiro/periodo?de=AAAA-MM-DD&ate=AAAA-MM-DD
 *
 * Relatório por intervalo livre, para quando o contador pede um recorte que não
 * é o mês fechado — trimestre, quinzena, ou o período do contrato dele. */
import type { Env } from '../../../_lib/types'
import type { AdminData } from '../_middleware'
import { listLancamentosPorPeriodo } from '../../../_lib/db'
import { json, erro } from '../../../_lib/http'

const DATA = /^\d{4}-\d{2}-\d{2}$/

export const onRequestGet: PagesFunction<Env, string, AdminData> = async ({
  env,
  request,
  data,
}) => {
  const q = new URL(request.url).searchParams
  const de = q.get('de') ?? ''
  const ate = q.get('ate') ?? ''
  if (!DATA.test(de) || !DATA.test(ate)) return erro('Informe as duas datas.', 422)
  if (de > ate) return erro('A data inicial não pode ser depois da final.', 422)

  const lancamentos = await listLancamentosPorPeriodo(env, data.sessao.tenantId, de, ate)
  return json({ de, ate, lancamentos })
}
