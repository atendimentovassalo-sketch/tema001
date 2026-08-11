/* Moldura comum das páginas legais: topo + coluna de leitura + rodapé.
 * Busca a funerária só para nome/telefone no cabeçalho e rodapé. */
import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { fetchPublicados } from '../memorial/api'
import type { Funeraria } from '../memorial/types'
import '../memorial/memorial.css'
import './legal.css'

export default function LegalLayout({
  titulo,
  atualizadoEm,
  children,
}: {
  titulo: string
  atualizadoEm: string
  children: ReactNode
}) {
  const [f, setF] = useState<Funeraria | null>(null)

  useEffect(() => {
    document.title = `${titulo} | Funerária`
    fetchPublicados({ limite: 1 })
      .then((r) => setF(r.funeraria))
      .catch(() => {})
  }, [titulo])

  return (
    <div className="memorial-root">
      <header className="topo">
        <div className="topo-in">
          <a className="wm"  href="/">
            {f?.nome ?? 'Funerária'}
            {f && (
              <small>
                {f.cidade} · {f.uf}
              </small>
            )}
          </a>
          {f && (
            <a className="tel" href={`tel:${f.telefone}`}>
              <span>
                <em>24 horas</em>
                <span className="num">{f.telefone}</span>
              </span>
            </a>
          )}
        </div>
      </header>

      <div className="legal-corpo">
        <p className="legal-atualizado">Atualizado em {atualizadoEm}</p>
        <h1>{titulo}</h1>
        {children}
        <a className="legal-voltar"  href="/">
          ← Voltar ao site
        </a>
      </div>

      <footer className="rodape">
        <p className="wm">
          {f?.nome ?? 'Funerária'}
          <small>Atendimento 24 horas</small>
        </p>
        <p className="autoriz" style={{ borderTop: 0 }}>
          <Link to="/privacidade">Política de Privacidade</Link> ·{' '}
          <Link to="/termos">Termos de Uso</Link>
        </p>
      </footer>
    </div>
  )
}
