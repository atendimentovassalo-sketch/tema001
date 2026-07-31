/* Obituário completo do inquilino: lista de todos os falecimentos publicados. */
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { funeraria, publicados } from './memorial-data'
import { ddmm } from './format'
import './memorial.css'

export default function Obituario() {
  const f = funeraria
  const itens = publicados({ limite: 5000 })

  useEffect(() => {
    document.title = `Obituário de ${f.cidade} | ${f.nome}`
  }, [f])

  return (
    <div
      className="memorial-root"
      style={{ ['--marca' as string]: f.corMarca }}
    >
      <header className="topo">
        <div className="topo-in">
          <Link className="wm" to="/funeraria">
            {f.nome}
            <small>
              {f.cidade} · {f.uf}
            </small>
          </Link>
          <a className="tel" href={`tel:${f.telefone}`}>
            <span>
              <em>24 horas</em>
              <span className="num">{f.telefone}</span>
            </span>
          </a>
        </div>
      </header>

      <section className="hero" style={{ paddingBottom: 56 }}>
        <p className="eti">{f.cidade} e região</p>
        <h1 style={{ maxWidth: 'none' }}>Obituário</h1>
      </section>

      <div className="corpo">
        <section className="sec lista">
          {itens.length === 0 && (
            <p className="vazio">Nenhuma nota publicada no momento.</p>
          )}
          {itens.map((m) => (
            <Link key={m.id} to={`/m/${m.slug}`}>
              <span className="n">{m.nomeCompleto}</span>
              <span className="d num">{ddmm(m.falecimentoISO)}</span>
            </Link>
          ))}
        </section>

        <p className="corrigir">
          <Link to="/funeraria">Voltar ao início</Link>
        </p>
      </div>

      <footer className="rodape">
        <p className="wm">
          {f.nome}
          <small>Atendimento 24 horas</small>
        </p>
        <a className="fone num" href={`tel:${f.telefone}`}>
          <small>Ligue a qualquer hora</small>
          {f.telefone}
        </a>
      </footer>
    </div>
  )
}
