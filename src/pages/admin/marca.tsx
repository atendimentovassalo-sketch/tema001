/* A marca da funerária no painel — logo do inquilino, com queda para o nome.
 *
 * POR QUE (20/08/2026): `/logo.png` estava escrito no código do login e do
 * menu lateral. Esse arquivo é a logo da São Francisco, e ele nem existe em
 * outros domínios: em novomodelo.com.br a requisição caía no index.html do SPA
 * e o painel abria com um retângulo de imagem quebrada — a primeira coisa que
 * um cliente novo veria do produto.
 *
 * A queda não é uma imagem genérica: é o NOME da funerária em tipo, na mesma
 * placa carvão. Uma funerária que ainda não subiu logo tem um painel que diz o
 * nome dela, e não um logotipo de outra empresa nem um espaço vazio. */
import { useEffect, useState } from 'react'
import { fetchFuneraria } from '../memorial/api'
import type { Funeraria } from '../memorial/types'

/** Quem é a funerária deste domínio. Resolve por host, sem exigir sessão —
 *  o login precisa da marca antes de qualquer senha. */
export function useFuneraria(): Funeraria | null {
  const [f, setF] = useState<Funeraria | null>(null)
  useEffect(() => {
    let vivo = true
    fetchFuneraria().then((r) => {
      if (vivo) setF(r)
    })
    return () => {
      vivo = false
    }
  }, [])
  return f
}

/**
 * `classe` recebe a classe da placa já existente (`adm-logo` no login,
 * `adm-lateral-marca img` no menu), para que logo e nome ocupem o mesmo lugar.
 * `alt` vazio quando há texto ao lado descrevendo a mesma coisa.
 */
export function MarcaFuneraria({
  f,
  classe,
  descrever = true,
}: {
  f: Funeraria | null
  classe: string
  descrever?: boolean
}) {
  if (f?.logoUrl) {
    return (
      <img
        className={classe}
        src={f.logoUrl}
        alt={descrever ? `${f.nome} — ${f.cidade}/${f.uf}` : ''}
      />
    )
  }
  /* Sem logo: o nome ocupa a placa. `aria-hidden` quando algo ao lado já diz o
     mesmo, para o leitor de tela não repetir. */
  return (
    <span
      className={`${classe} adm-marca-texto`}
      aria-hidden={descrever ? undefined : true}
    >
      {f?.nome ?? 'Painel da funerária'}
    </span>
  )
}
