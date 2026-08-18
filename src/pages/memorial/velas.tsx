/* Desenhos de vela, em SVG inline.
 *
 * Por que SVG e não os arquivos de 08/08: a vela em bitmap animado pesava de 49
 * a 227 KB cada, e cinco delas custaram 684 KB numa página que exibia tudo a
 * 62 px — foi por isso que a v5 as cortou. Em SVG cada uma pesa ~1 KB, escala
 * sem serrilhar e, principalmente, **obedece `prefers-reduced-motion`**: um GIF
 * continua tremulando para quem tem enxaqueca ou sensibilidade vestibular, e não
 * há como pedir que pare.
 *
 * A chama é a mesma em todos; o que muda é o corpo. Isso mantém o conjunto
 * coerente e o arquivo pequeno.
 */

export interface TipoVela {
  id: string
  nome: string
}

export const TIPOS_VELA: TipoVela[] = [
  { id: 'classica', nome: 'Clássica' },
  { id: 'alta', nome: 'Alta' },
  { id: 'votiva', nome: 'Votiva' },
  { id: 'cruz', nome: 'Cruz' },
  { id: 'terco', nome: 'Terço' },
]

export const TIPO_VELA_PADRAO = 'classica'

function Chama() {
  return (
    <g className="vsvg-chama">
      <ellipse cx="16" cy="9" rx="3.1" ry="5" fill="#F5A623" />
      <ellipse cx="16" cy="10" rx="1.5" ry="2.9" fill="#FFF1C2" />
    </g>
  )
}

/** Uma vela. `tipo` desconhecido ou nulo cai na clássica — homenagem antiga
 *  (anterior à escolha de desenho) continua aparecendo normalmente. */
export function Vela({
  tipo,
  tamanho = 40,
}: {
  tipo?: string | null
  tamanho?: number
}) {
  const t = TIPOS_VELA.some((x) => x.id === tipo) ? tipo : TIPO_VELA_PADRAO

  return (
    <svg
      className="vsvg"
      width={tamanho}
      height={tamanho * 1.6}
      viewBox="0 0 32 52"
      role="img"
      aria-label="Vela acesa"
    >
      <Chama />

      {t === 'classica' && (
        <>
          <rect x="11" y="16" width="10" height="30" rx="2" fill="#F3EDE0" />
          <rect x="11" y="16" width="3.4" height="30" rx="2" fill="#FFFDF7" />
          <ellipse cx="16" cy="46" rx="7" ry="2.4" fill="#E0D8C6" />
        </>
      )}

      {t === 'alta' && (
        <>
          <rect x="12.5" y="15" width="7" height="33" rx="1.6" fill="#F3EDE0" />
          <rect
            x="12.5"
            y="15"
            width="2.4"
            height="33"
            rx="1.6"
            fill="#FFFDF7"
          />
          <ellipse cx="16" cy="48" rx="5.5" ry="2" fill="#E0D8C6" />
        </>
      )}

      {t === 'votiva' && (
        <>
          {/* copo de vidro: retângulo translúcido por cima da cera */}
          <rect x="9" y="22" width="14" height="24" rx="2.5" fill="#F0EAD8" />
          <rect
            x="8"
            y="20"
            width="16"
            height="27"
            rx="3"
            fill="#BFD8DC"
            opacity="0.42"
          />
          <rect
            x="9.6"
            y="21"
            width="2.6"
            height="25"
            rx="2"
            fill="#FFFFFF"
            opacity="0.5"
          />
        </>
      )}

      {t === 'cruz' && (
        <>
          <rect x="11" y="16" width="10" height="30" rx="2" fill="#F3EDE0" />
          <rect x="11" y="16" width="3.4" height="30" rx="2" fill="#FFFDF7" />
          {/* cruz gravada no corpo */}
          <rect
            x="15.1"
            y="26"
            width="1.8"
            height="11"
            rx="0.6"
            fill="#C9A227"
          />
          <rect
            x="12.6"
            y="29.6"
            width="6.8"
            height="1.8"
            rx="0.6"
            fill="#C9A227"
          />
          <ellipse cx="16" cy="46" rx="7" ry="2.4" fill="#E0D8C6" />
        </>
      )}

      {t === 'terco' && (
        <>
          <rect x="11" y="16" width="10" height="30" rx="2" fill="#F3EDE0" />
          <rect x="11" y="16" width="3.4" height="30" rx="2" fill="#FFFDF7" />
          <ellipse cx="16" cy="46" rx="7" ry="2.4" fill="#E0D8C6" />
          {/* contas do terço caindo pela lateral */}
          {[28, 32, 36, 40].map((y, i) => (
            <circle key={y} cx={22 + (i % 2)} cy={y} r="1.5" fill="#8A6828" />
          ))}
        </>
      )}
    </svg>
  )
}
