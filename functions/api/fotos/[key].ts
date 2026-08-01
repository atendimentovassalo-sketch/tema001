/* GET /api/fotos/:key — serve uma imagem do R2 (pública; fotos aparecem nas
 * páginas de memorial). Cache longo: o nome é único (uuid). */
import type { Env } from '../../_lib/types'

export const onRequestGet: PagesFunction<Env, 'key'> = async ({
  env,
  params,
}) => {
  const key = String(params.key)
  // evita path traversal: só nome de arquivo simples
  if (!/^[a-zA-Z0-9._-]+$/.test(key)) return new Response('Inválido', { status: 400 })

  const obj = await env.PHOTOS.get(key)
  if (!obj) return new Response('Não encontrada', { status: 404 })

  const headers = new Headers()
  obj.writeHttpMetadata(headers)
  headers.set('etag', obj.httpEtag)
  headers.set('cache-control', 'public, max-age=31536000, immutable')
  return new Response(obj.body, { headers })
}
