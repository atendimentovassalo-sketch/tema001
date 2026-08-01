/* POST /api/admin/fotos — sobe uma imagem para o R2 e devolve o caminho.
 * Corpo = bytes da imagem; content-type = image/jpeg|png|webp. */
import type { Env } from '../../_lib/types'
import type { AdminData } from './_middleware'
import { json, erro } from '../../_lib/http'

const TIPOS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}
const MAX_BYTES = 6 * 1024 * 1024 // 6 MB

export const onRequestPost: PagesFunction<Env, string, AdminData> = async ({
  env,
  request,
}) => {
  const tipo = (request.headers.get('content-type') ?? '').split(';')[0].trim()
  const ext = TIPOS[tipo]
  if (!ext) return erro('Formato não suportado (use JPEG, PNG ou WebP).', 415)

  const buf = await request.arrayBuffer()
  if (buf.byteLength === 0) return erro('Arquivo vazio.', 400)
  if (buf.byteLength > MAX_BYTES) return erro('Imagem grande demais (máx. 6 MB).', 413)

  const nome = `${crypto.randomUUID()}.${ext}`
  await env.PHOTOS.put(nome, buf, {
    httpMetadata: { contentType: tipo },
  })

  return json({ ok: true, url: `/api/fotos/${nome}` }, 201)
}
