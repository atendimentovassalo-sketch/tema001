/* POST /api/admin/fotos — sobe uma imagem para o R2 e devolve o caminho.
 * Corpo = bytes da imagem; content-type = image/jpeg|png|webp. */
import type { Env } from '../../_lib/types'
import type { AdminData } from './_middleware'
import { json, erro } from '../../_lib/http'
import { tipoRealDaImagem } from '../../_lib/imagem'

const MAX_BYTES = 6 * 1024 * 1024 // 6 MB

export const onRequestPost: PagesFunction<Env, string, AdminData> = async ({
  env,
  request,
}) => {
  const buf = await request.arrayBuffer()
  if (buf.byteLength === 0) return erro('Arquivo vazio.', 400)
  if (buf.byteLength > MAX_BYTES) return erro('Imagem grande demais (máx. 6 MB).', 413)

  /* Confere a assinatura binária, e não o `content-type` declarado — o mesmo
   * rigor do upload da família. Rota autenticada exigir MENOS que rota pública
   * era o inverso do razoável: quem tem senha do painel também erra arquivo, e
   * um .exe renomeado para .jpg entrava no R2 sem discussão. */
  const tipo = tipoRealDaImagem(buf)
  if (!tipo) return erro('Formato não suportado (use JPEG, PNG ou WebP).', 415)

  const nome = `${crypto.randomUUID()}.${tipo.ext}`
  await env.PHOTOS.put(nome, buf, {
    httpMetadata: { contentType: tipo.mime },
  })

  return json({ ok: true, url: `/api/fotos/${nome}` }, 201)
}
