/* A nota como ela vai ao ar, para quem tem o link da família.
 *
 * POR QUE (18/08/2026): quem escreve a história e sobe as fotos precisa VER a
 * página antes de ela existir para os outros. Até aqui a área da família
 * oferecia "ver como as pessoas veem", mas o link ia para /m/:slug — que só
 * serve memorial publicado. Em rascunho, dava "não encontrado" justamente para
 * quem estava preenchendo.
 *
 * Reaproveita a página real (`MemorialPage`) com os dados vindos do endpoint do
 * token: o que a família vê aqui é a página, não uma representação dela.
 */
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import MemorialPage from './MemorialPage'
import { api } from '@/lib/api'
import type { Memorial } from './types'

export default function PreviaFamilia() {
  const { token = '' } = useParams()
  const [memorial, setMemorial] = useState<Memorial | null>(null)
  const [publicado, setPublicado] = useState(false)
  const [estado, setEstado] = useState<'carregando' | 'ok' | 'invalido'>(
    'carregando',
  )

  useEffect(() => {
    let vivo = true
    api
      .get<{ memorial: Memorial; publicado: boolean }>(
        `/api/familia/${encodeURIComponent(token)}/previa`,
      )
      .then((r) => {
        if (!vivo) return
        setMemorial(r.memorial)
        setPublicado(r.publicado)
        setEstado('ok')
      })
      .catch(() => {
        if (vivo) setEstado('invalido')
      })
    return () => {
      vivo = false
    }
  }, [token])

  if (estado === 'carregando')
    return <div className="fam fam-centro">Carregando a prévia…</div>

  if (estado === 'invalido' || !memorial)
    return (
      <div className="fam fam-centro">
        <div className="fam-caixa">
          <h1>Link indisponível</h1>
          <p>Este link não é mais válido — ele vale por 30 dias.</p>
          <p className="fam-dica">
            Peça um link novo à funerária que fez o atendimento.
          </p>
        </div>
      </div>
    )

  return (
    <MemorialPage
      memorialOverride={memorial}
      faixa={
        <div className="mv3-previa-faixa" role="status">
          <strong>Prévia</strong> —{' '}
          {publicado
            ? 'é assim que a página está para quem visita.'
            : 'esta página ainda não está no ar — só quem tem o link da família a enxerga.'}{' '}
          <Link to={`/memorial/familia/${encodeURIComponent(token)}`}>
            Voltar e continuar editando
          </Link>
        </div>
      }
    />
  )
}
