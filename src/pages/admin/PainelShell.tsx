/* Moldura única do painel: barra lateral à esquerda + hambúrguer no celular.
 *
 * Antes, cada uma das cinco páginas repetia o próprio cabeçalho, e o menu já
 * divergia entre elas — o Painel listava as cinco seções, Usuários e
 * Configurações só tinham "← Painel", e as telas novas de gestão tinham uma
 * terceira variação. Toda seção nova exigia editar cinco arquivos, e quem
 * esquecesse um deixava a funerária sem caminho de volta. Aqui é um lugar só.
 *
 * No celular a barra vira gaveta: fechada por padrão, aberta pelo hambúrguer.
 * Fecha ao navegar, no Esc e no clique fora — as três saídas que a pessoa tenta
 * sem pensar. */
import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'
import type { UsuarioAuth } from './auth'

interface Secao {
  para: string
  rotulo: string
  /* `exato` só para a raiz: sem isso "/admin" ficaria marcado como ativo em
   * todas as outras, porque todas começam com ele. */
  exato?: boolean
}

const SECOES: Secao[] = [
  { para: '/admin', rotulo: 'Memoriais', exato: true },
  { para: '/admin/clientes', rotulo: 'Clientes' },
  { para: '/admin/financeiro', rotulo: 'Financeiro' },
  { para: '/admin/usuarios', rotulo: 'Usuários' },
  { para: '/admin/config', rotulo: 'Configurações' },
]

export default function PainelShell({
  usuario,
  titulo,
  children,
}: {
  usuario: UsuarioAuth
  titulo: string
  children: React.ReactNode
}) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [aberto, setAberto] = useState(false)
  const botaoRef = useRef<HTMLButtonElement>(null)

  /* Fecha ao trocar de página: sem isso a gaveta fica aberta por cima do
   * conteúdo novo no celular. */
  useEffect(() => setAberto(false), [pathname])

  useEffect(() => {
    if (!aberto) return
    function aoTeclar(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setAberto(false)
        botaoRef.current?.focus() // devolve o foco para quem abriu
      }
    }
    document.addEventListener('keydown', aoTeclar)
    return () => document.removeEventListener('keydown', aoTeclar)
  }, [aberto])

  async function sair() {
    await api.post('/api/auth/logout')
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className={`adm adm-layout${aberto ? ' adm-layout-aberto' : ''}`}>
      {/* Barra superior só no celular: guarda o hambúrguer e o título. */}
      <header className="adm-barra-mobile">
        <button
          ref={botaoRef}
          className="adm-hamburguer"
          onClick={() => setAberto((v) => !v)}
          aria-expanded={aberto}
          aria-controls="adm-menu"
          aria-label={aberto ? 'Fechar menu' : 'Abrir menu'}
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>
        <span className="adm-barra-titulo">{titulo}</span>
      </header>

      {/* Véu: só existe com a gaveta aberta, e é o clique-fora. */}
      {aberto && (
        <div
          className="adm-veu"
          onClick={() => setAberto(false)}
          aria-hidden="true"
        />
      )}

      <nav className="adm-lateral" id="adm-menu" aria-label="Seções do painel">
        <a className="adm-lateral-marca" href="/">
          <img src="/logo.png" alt="" />
          <span>
            Painel da funerária
            <small>{usuario.nome}</small>
          </span>
        </a>

        <ul className="adm-lateral-lista">
          {SECOES.map((s) => {
            const ativo = s.exato
              ? pathname === s.para
              : pathname.startsWith(s.para)
            return (
              <li key={s.para}>
                <Link
                  to={s.para}
                  className={
                    ativo
                      ? 'adm-lateral-link adm-lateral-ativo'
                      : 'adm-lateral-link'
                  }
                  aria-current={ativo ? 'page' : undefined}
                >
                  {s.rotulo}
                </Link>
              </li>
            )
          })}
        </ul>

        <button className="adm-lateral-sair" onClick={sair}>
          Sair
        </button>
      </nav>

      <main className="adm-main">{children}</main>
    </div>
  )
}
