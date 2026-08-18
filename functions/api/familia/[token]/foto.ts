/* POST   /api/familia/:token/foto        -> sobe uma foto para a galeria
 * DELETE /api/familia/:token/foto?id=... -> remove uma foto da galeria
 *
 * Fase 1 da galeria, conforme decidido em 12/08/2026: SÓ a família envia, por
 * link com token; o visitante apenas vê. O envio público (fase 2) continua
 * desligado e depende dos cinco limites registrados no DECISOES.md.
 *
 * Este endpoint é público-com-token, então valida mais do que o do painel:
 * confere a ASSINATURA BINÁRIA do arquivo, e não o content-type declarado.
 * Cabeçalho é texto que qualquer um escreve — sem essa checagem, o R2 vira
 * hospedagem anônima de qualquer coisa com um content-type mentido.
 */
import type { Env } from '../../../_lib/types'
import {
  getAcessoFamilia,
  adicionarFotoPelaFamilia,
  removerFotoPelaFamilia,
} from '../../../_lib/db'
import { json, erro } from '../../../_lib/http'

const MAX_BYTES = 8 * 1024 * 1024
const MAX_FOTOS = 12

/** Detecta o tipo pelos primeiros bytes. Devolve null para o que não for
 *  imagem que a gente aceita — inclusive SVG, que é XML e executa script. */
function tipoReal(buf: ArrayBuffer): { mime: string; ext: string } | null {
  const b = new Uint8Array(buf)
  if (b.length < 12) return null
  // JPEG: FF D8 FF
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff)
    return { mime: 'image/jpeg', ext: 'jpg' }
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 &&
    b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a
  )
    return { mime: 'image/png', ext: 'png' }
  // WebP: "RIFF" .... "WEBP"
  if (
    b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
    b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50
  )
    return { mime: 'image/webp', ext: 'webp' }
  return null
}

export const onRequestPost: PagesFunction<Env> = async ({ env, request, params }) => {
  const acesso = await getAcessoFamilia(env, String(params.token))
  if (!acesso) return erro('Link inválido ou vencido.', 404)

  const buf = await request.arrayBuffer()
  if (buf.byteLength === 0) return erro('Arquivo vazio.', 400)
  if (buf.byteLength > MAX_BYTES)
    return erro('Imagem grande demais (máximo 8 MB).', 413)

  const tipo = tipoReal(buf)
  if (!tipo) return erro('Envie uma foto em JPEG, PNG ou WebP.', 415)

  const nome = `${crypto.randomUUID()}.${tipo.ext}`
  await env.PHOTOS.put(nome, buf, { httpMetadata: { contentType: tipo.mime } })

  const url = `/api/fotos/${nome}`
  const coube = await adicionarFotoPelaFamilia(env, acesso.memorialId, url, MAX_FOTOS)
  if (!coube)
    return erro(`A galeria já tem ${MAX_FOTOS} fotos. Apague alguma para incluir outra.`, 409)

  return json({ ok: true, url }, 201)
}

export const onRequestDelete: PagesFunction<Env> = async ({ env, request, params }) => {
  const acesso = await getAcessoFamilia(env, String(params.token))
  if (!acesso) return erro('Link inválido ou vencido.', 404)

  const id = new URL(request.url).searchParams.get('id') ?? ''
  if (!id) return erro('Foto não informada.', 422)

  const ok = await removerFotoPelaFamilia(env, acesso.memorialId, id)
  if (!ok) return erro('Foto não encontrada.', 404)
  return json({ ok: true })
}
