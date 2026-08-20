/* Moldura comum das páginas legais: topo + coluna de leitura + rodapé.
 *
 * O conteúdo é uma FUNÇÃO da funerária, e não elementos prontos: os documentos
 * nomeiam o controlador dos dados, o CNPJ e o foro, e esses dados mudam por
 * inquilino (ver `identidade.ts` e a migration 0016). Enquanto o inquilino não
 * chegou, a página não é renderizada pela metade — as frases jurídicas seriam
 * montadas com `null` e sairiam genéricas por um instante antes de trocar,
 * numa página que as pessoas leem justamente para saber com quem estão
 * lidando. */
import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { fetchFuneraria } from '../memorial/api'
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
  children: (f: Funeraria | null) => ReactNode
}) {
  const [f, setF] = useState<Funeraria | null>(null)
  const [pronto, setPronto] = useState(false)

  useEffect(() => {
    let vivo = true
    fetchFuneraria()
      .then((r) => {
        if (!vivo) return
        setF(r)
        setPronto(true)
      })
      .catch(() => {
        if (vivo) setPronto(true)
      })
    return () => {
      vivo = false
    }
  }, [])

  useEffect(() => {
    document.title = f ? `${titulo} | ${f.nome}` : titulo
  }, [titulo, f])

  return (
    <div className="memorial-root">
      <header className="topo">
        <div className="topo-in">
          <a className="wm" href="/">
            {f?.nome ?? 'Funerária'}
            {f && (
              <small>
                {f.cidade} · {f.uf}
              </small>
            )}
          </a>
          {f && (
            /* tel: com os dígitos do WhatsApp (já em formato internacional); o
               `f.telefone` é a grafia de leitura, não um número discável. */
            <a className="tel" href={`tel:+${f.whatsapp}`}>
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
        {pronto ? children(f) : <p className="legal-atualizado">Carregando…</p>}
        <a className="legal-voltar" href="/">
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
