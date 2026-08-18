/* GET /api/fotos/:key — serve uma imagem do R2.
 *
 * Só é pública a imagem que ALGUM memorial referencia (galeria ou retrato).
 * O resto exige sessão. O cache é de 1 hora, não de 1 ano: foto removida pela
 * família precisa sair de circulação em tempo humano. */
import type { Env } from '../../_lib/types'
import { fotoEhPublica, getSessaoComUsuario } from '../../_lib/db'
import { lerTokenSessao } from '../../_lib/auth'

export const onRequestGet: PagesFunction<Env, 'key'> = async ({
  env,
  params,
  request,
}) => {
  const key = String(params.key)
  // evita path traversal: só nome de arquivo simples
  if (!/^[a-zA-Z0-9._-]+$/.test(key)) return new Response('Inválido', { status: 400 })

  /* Só serve publicamente o que ALGUM memorial referencia. Antes, qualquer
   * objeto do R2 saía por esta rota para quem soubesse a chave — o domínio virava
   * hospedagem anônima de imagem, e uma foto ainda não vinculada (ou já
   * desvinculada) continuava aberta. Registrado como pendência desde 13/08 com a
   * observação de que viraria furo real assim que houvesse upload público; o
   * upload da família existe desde 18/08, então a condição se cumpriu.
   *
   * A exceção é a equipe logada: durante o cadastro a foto é enviada ANTES de o
   * memorial existir, e sem isto a pré-visualização no editor quebraria. */
  const publica = await fotoEhPublica(env, `/api/fotos/${key}`)
  if (!publica) {
    const token = lerTokenSessao(request)
    const sessao = token ? await getSessaoComUsuario(env, token) : null
    if (!sessao) return new Response('Não encontrada', { status: 404 })
  }

  const obj = await env.PHOTOS.get(key)
  if (!obj) return new Response('Não encontrada', { status: 404 })

  const headers = new Headers()
  obj.writeHttpMetadata(headers)
  headers.set('etag', obj.httpEtag)
  /* Uma hora, e não um ano. Foto removida pela família tem
   * de sair de circulação em tempo humano. `private` quando o acesso dependeu da
   * sessão — cachear isso num CDN compartilhado entregaria a foto a quem não
   * está logado. */
  headers.set('cache-control', publica ? 'public, max-age=3600' : 'private, no-store')
  return new Response(obj.body, { headers })
}
