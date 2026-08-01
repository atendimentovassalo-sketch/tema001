/* GET /api/admin/homenagens/pendentes — fila de moderação do tenant. */
import type { Env } from '../../../_lib/types'
import type { AdminData } from '../_middleware'
import { listHomenagensPendentes } from '../../../_lib/db'
import { json } from '../../../_lib/http'

export const onRequestGet: PagesFunction<Env, string, AdminData> = async ({
  env,
  data,
}) => {
  const pendentes = await listHomenagensPendentes(env, data.sessao.tenantId)
  return json({ pendentes })
}
