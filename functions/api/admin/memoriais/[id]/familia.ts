/* POST   /api/admin/memoriais/:id/familia -> emite (ou reemite) o link da família
 * DELETE /api/admin/memoriais/:id/familia -> revoga o link
 *
 * Reemitir invalida o anterior na hora: é o caminho de "a família perdeu o
 * link" e também o de "esse link foi parar em grupo errado". */
import type { Env } from '../../../../_lib/types'
import type { AdminData } from '../../_middleware'
import { emitirTokenFamilia, revogarTokenFamilia } from '../../../../_lib/db'
import { json, erro, tokenAleatorio } from '../../../../_lib/http'

const DIAS = 30

export const onRequestPost: PagesFunction<Env, string, AdminData> = async ({
  env,
  request,
  params,
  data,
}) => {
  const token = tokenAleatorio()
  const ok = await emitirTokenFamilia(
    env,
    data.sessao.tenantId,
    String(params.id),
    token,
    DIAS,
  )
  if (!ok) return erro('Memorial não encontrado.', 404)

  const origem = new URL(request.url).origin
  return json({ ok: true, url: `${origem}/familia/${token}`, dias: DIAS }, 201)
}

export const onRequestDelete: PagesFunction<Env, string, AdminData> = async ({
  env,
  params,
  data,
}) => {
  await revogarTokenFamilia(env, data.sessao.tenantId, String(params.id))
  return json({ ok: true })
}
