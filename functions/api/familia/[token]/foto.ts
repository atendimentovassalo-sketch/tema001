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
import { tipoRealDaImagem } from '../../../_lib/imagem'

const MAX_BYTES = 8 * 1024 * 1024
const MAX_FOTOS = 12

export const onRequestPost: PagesFunction<Env> = async ({ env, request, params }) => {
  const acesso = await getAcessoFamilia(env, String(params.token))
  if (!acesso) return erro('Link inválido ou vencido.', 404)

  const buf = await request.arrayBuffer()
  if (buf.byteLength === 0) return erro('Arquivo vazio.', 400)
  if (buf.byteLength > MAX_BYTES)
    return erro('Imagem grande demais (máximo 8 MB).', 413)

  const tipo = tipoRealDaImagem(buf)
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
