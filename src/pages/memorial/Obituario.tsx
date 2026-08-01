/* Obituário completo do inquilino: grade de falecimentos publicados, com
 * foto (ou iniciais), busca por nome e selo "Velório hoje". */
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchPublicados } from './api'
import { anoBR, ddmm, iniciais, retratoDe } from './format'
import type { Funeraria, Memorial } from './types'
import './memorial.css'

/** Normaliza para busca acento-insensível. */
function norm(s: string): string {
  return s
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
}

/** true se a pessoa tem velório com início hoje. */
function velorioHoje(m: Memorial): boolean {
  const hoje = new Date()
  return m.eventos.some((e) => {
    if (e.tipo !== 'velorio' || !e.inicioISO) return false
    const d = new Date(e.inicioISO)
    return (
      d.getFullYear() === hoje.getFullYear() &&
      d.getMonth() === hoje.getMonth() &&
      d.getDate() === hoje.getDate()
    )
  })
}

export default function Obituario() {
  const [f, setF] = useState<Funeraria | null>(null)
  const [todos, setTodos] = useState<Memorial[]>([])
  const [busca, setBusca] = useState('')

  useEffect(() => {
    let vivo = true
    fetchPublicados({ limite: 5000 })
      .then((r) => {
        if (!vivo) return
        setF(r.funeraria)
        setTodos(r.memoriais)
      })
      .catch(() => {})
    return () => {
      vivo = false
    }
  }, [])

  useEffect(() => {
    if (f) document.title = `Obituário de ${f.cidade} | ${f.nome}`
  }, [f])

  const itens = useMemo(() => {
    const q = norm(busca)
    if (!q) return todos
    return todos.filter((m) => norm(m.nomeCompleto).includes(q))
  }, [todos, busca])

  if (!f) {
    return <div className="memorial-root" style={{ minHeight: '100vh' }} />
  }

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

      <div className="corpo obit-corpo">
        <div className="obit-busca">
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder={`Buscar por nome em ${f.cidade}…`}
            aria-label="Buscar falecimento por nome"
          />
          <span className="obit-contagem num">
            {itens.length}{' '}
            {itens.length === 1 ? 'nota publicada' : 'notas publicadas'}
          </span>
        </div>

        {itens.length === 0 ? (
          <p className="vazio">
            {busca
              ? `Nenhuma nota encontrada para "${busca}".`
              : 'Nenhuma nota publicada no momento.'}
          </p>
        ) : (
          <ul className="obit-grid">
            {itens.map((m) => {
              const retrato = retratoDe(m)
              const hoje = velorioHoje(m)
              return (
                <li key={m.id}>
                  <Link className="obit-card" to={`/m/${m.slug}`}>
                    <span className="obit-foto">
                      {retrato ? (
                        <img src={retrato} alt="" loading="lazy" />
                      ) : (
                        <span className="ini" aria-hidden="true">
                          {iniciais(m.nomeCompleto)}
                        </span>
                      )}
                      {hoje && <span className="velhoje">Velório hoje</span>}
                    </span>
                    <span className="obit-nome">{m.nomeCompleto}</span>
                    <span className="obit-datas num">
                      {m.nascimentoISO ? `${anoBR(m.nascimentoISO)} – ` : ''}
                      {anoBR(m.falecimentoISO)}
                    </span>
                    <span className="obit-falec num">
                      Faleceu em {ddmm(m.falecimentoISO)}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}

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
