/* Home do inquilino (funerária): hero, sobre, últimos falecimentos e link ao obituário. */
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { funeraria, publicados } from './memorial-data'
import './memorial.css'

export default function ObituarioHome() {
  const f = funeraria
  const ultimos = publicados({ limite: 3 })

  useEffect(() => {
    document.title = `${f.nome} — Funerária 24 horas em ${f.cidade}/${f.uf}`
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

      <section
        className="hero"
        style={{ textAlign: 'left', paddingBottom: 60 }}
      >
        <p className="eti">
          {f.cidade} e região{f.desde ? ` · desde ${f.desde}` : ''}
        </p>
        <h1 style={{ margin: '18px 0 0', maxWidth: '18ch' }}>
          Cuidamos de tudo, a qualquer hora.
        </h1>
        <p
          className="datas num"
          style={{ marginTop: 26, fontSize: '2rem', letterSpacing: 0 }}
        >
          <a
            href={`tel:${f.telefone}`}
            style={{ color: 'var(--brass)', textDecoration: 'none' }}
          >
            {f.telefone}
          </a>
        </p>
      </section>

      <div className="corpo">
        {f.sobre && (
          <section className="sec">
            <h2 className="eti">Quem atende você</h2>
            <p style={{ fontSize: '1.12rem', lineHeight: 1.72 }}>{f.sobre}</p>
          </section>
        )}

        <section className="sec lista">
          <h2 className="eti">Falecimentos recentes</h2>
          {ultimos.map((m) => (
            <Link key={m.id} to={`/m/${m.slug}`}>
              <span className="n">{m.nomeCompleto}</span>
              <span className="d">ver nota</span>
            </Link>
          ))}
        </section>

        <p className="corrigir">
          <Link to="/obituario">Ver todo o obituário</Link>
        </p>
      </div>

      <footer className="rodape">
        <p className="wm">
          {f.nome}
          <small>Atendimento 24 horas</small>
        </p>
        <p className="end">
          {f.endereco}
          <br />
          {f.cidade} · {f.uf}
        </p>
        <a className="fone num" href={`tel:${f.telefone}`}>
          <small>Ligue a qualquer hora</small>
          {f.telefone}
        </a>
      </footer>
    </div>
  )
}
