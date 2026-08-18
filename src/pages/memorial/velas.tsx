/* As velas do memorial — as imagens animadas de 08/08/2026.
 *
 * HISTÓRICO CURTO
 * ---------------
 * A v5 cortou estas imagens porque os arquivos originais somavam 684 KB para
 * aparecer a 62 px, e no lugar entraram desenhos em SVG. Em 18/08/2026 o Felipe
 * comparou as três formas de usar as animadas e escolheu a versão completa:
 * animadas no destaque, no mural e na hora de escolher o desenho.
 *
 * O QUE MUDOU PARA CABER
 * ----------------------
 * As imagens foram reencodadas de 600 px para o tamanho em que realmente
 * aparecem — 128 px nas pequenas, 192 px no destaque. As cinco pequenas somam
 * 53 KB, contra 684 KB dos originais. E elas NÃO entram no bundle: são arquivos
 * estáticos em /assets/velas/, baixados em paralelo, cacheados pelo navegador e
 * reaproveitados entre um memorial e outro — quem visita o segundo memorial já
 * não baixa vela nenhuma.
 *
 * POR QUE EM /assets/ E COM -v1
 * -----------------------------
 * `/assets/*` já é rota do Worker no domínio do cliente; qualquer outro caminho
 * (`/velas/*`) não seria proxiado e daria 404 em funerariacatanduvas.com.br. E o
 * sufixo -v1 existe porque estes nomes não são hasheados pelo Vite: sem ele, uma
 * troca de arte futura ficaria presa no cache do CDN.
 *
 * MOVIMENTO
 * ---------
 * WebP animado não obedece `prefers-reduced-motion` — não há como pedir que
 * pare. Por isso cada vela tem um quadro parado (`-parada-v1`), servido pelo
 * <picture> a quem pediu menos movimento no sistema. Quem não pediu nunca baixa
 * o quadro parado, e quem pediu nunca baixa a animação.
 */

export interface TipoVela {
  id: string
  nome: string
  /** nome do arquivo em /assets/velas — não é o id, e não pode virar o id:
   *  o banco já guarda 'classica'/'votiva' em homenagens publicadas. */
  arquivo: string
}

export const TIPOS_VELA: TipoVela[] = [
  { id: 'classica', nome: 'Clássica', arquivo: 'branca' },
  { id: 'alta', nome: 'Alta', arquivo: 'alta' },
  { id: 'votiva', nome: 'Votiva', arquivo: 'ambar' },
  { id: 'cruz', nome: 'Cruz', arquivo: 'cruz' },
  { id: 'terco', nome: 'Terço', arquivo: 'terco' },
]

export const TIPO_VELA_PADRAO = 'classica'

const BASE = '/assets/velas'

function arquivoDe(tipo?: string | null): string {
  const t = TIPOS_VELA.find((x) => x.id === tipo)
  /* Tipo desconhecido ou nulo cai na clássica: homenagem anterior à escolha de
   * desenho continua aparecendo normalmente, sem buraco no mural. */
  return t ? t.arquivo : 'branca'
}

/** Uma vela acesa.
 *
 *  `forma`:
 *   - 'circulo' — recorte redondo, para o medalhão do mural e do contador. O
 *     fundo preto da arte vira o próprio disco, sem emenda.
 *   - 'placa'  — quadrado de canto arredondado, para a escolha do desenho: a
 *     cruz e as contas do terço precisam do quadrado inteiro para se distinguir.
 */
export function Vela({
  tipo,
  tamanho = 44,
  forma = 'circulo',
  grande = false,
}: {
  tipo?: string | null
  tamanho?: number
  forma?: 'circulo' | 'placa'
  grande?: boolean
}) {
  /* O destaque usa a arte de 192 px, e segue o desenho escolhido: ver a vela
   * grande mudar na hora em que se escolhe é o que deixa claro que a escolha
   * vai junto com a homenagem. Só a vela escolhida é baixada — as outras
   * quatro artes grandes só saem do servidor se a pessoa trocar. */
  const nome = arquivoDe(tipo) + (grande ? '-g' : '')

  return (
    <picture>
      <source
        media="(prefers-reduced-motion: reduce)"
        srcSet={`${BASE}/${nome}-parada-v1.webp`}
        type="image/webp"
      />
      <img
        className={`vela-img vela-img--${forma}`}
        src={`${BASE}/${nome}-v1.webp`}
        width={tamanho}
        height={tamanho}
        alt="Vela acesa"
        /* Sem lazy: as velas do mural estão logo abaixo da dobra e aparecer
         * uma a uma enquanto a pessoa rola fica pior que baixar as cinco. */
        decoding="async"
        draggable={false}
      />
    </picture>
  )
}
