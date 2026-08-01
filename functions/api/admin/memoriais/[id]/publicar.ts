/* POST /api/admin/memoriais/:id/publicar — { publicar: boolean } */
import { z } from 'zod'
import type { Env } from '../../../../_lib/types'
import type { AdminData } from '../../_middleware'
import { publicarMemorial } from '../../../../_lib/db'
import { json, erro, lerJson } from '../../../../_lib/http'

const schema = z.object({ publicar: z.boolean().default(true) })

export const onRequestPost: PagesFunction<Env, 'id', AdminData> = async ({
  env,
  request,
  params,
  data,
}) => {
  let body: unknown = {}
  try {
    body = await lerJson(request)
  } catch {
    // corpo vazio = publicar
  }
  const parsed = schema.safeParse(body ?? {})
  const publicar = parsed.success ? parsed.data.publicar : true
  const ok = await publicarMemorial(
    env,
    data.sessao.tenantId,
    String(params.id),
    publicar,
  )
  if (!ok) return erro('Memorial não encontrado.', 404)
  return json({ ok: true, status: publicar ? 'publicado' : 'rascunho' })
}
