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

/** Confere os primeiros bytes (magic bytes) — o content-type do cliente não
 *  é confiável; isto garante que o arquivo é mesmo a imagem declarada. */
function assinaturaValida(tipo: string, b: Uint8Array): boolean {
  if (tipo === 'image/jpeg') return b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff
  if (tipo === 'image/png')
    return b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47
  if (tipo === 'image/webp')
    return (
      b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
      b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50
    )
  return false
}

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

  if (!assinaturaValida(tipo, new Uint8Array(buf.slice(0, 12))))
    return erro('Arquivo não é uma imagem válida.', 415)

  const nome = `${crypto.randomUUID()}.${ext}`
  await env.PHOTOS.put(nome, buf, {
    httpMetadata: { contentType: tipo },
  })

  return json({ ok: true, url: `/api/fotos/${nome}` }, 201)
}
