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
import { MarcaFuneraria, useFuneraria } from './marca'

interface Secao {
  para: string
  rotulo: string
  /* `exato` só para a raiz: sem isso "/admin" ficaria marcado como ativo em
   * todas as outras, porque todas começam com ele. */
  exato?: boolean
}

/* Duas listas, e não uma de cinco itens: o que se usa todo dia fica em cima, e
 * o que se mexe uma vez por mês desce para um grupo separado. Menu em que tudo
 * tem o mesmo peso obriga a ler os cinco toda vez para achar um. */
const DIA_A_DIA: Secao[] = [
  { para: '/admin', rotulo: 'Memoriais', exato: true },
  { para: '/admin/clientes', rotulo: 'Clientes' },
  { para: '/admin/financeiro', rotulo: 'Financeiro' },
]

const AJUSTES: Secao[] = [
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
  const funeraria = useFuneraria()
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
        <Link className="adm-lateral-marca" to="/admin">
          <MarcaFuneraria f={funeraria} classe="" descrever={false} />
          <span>
            Painel da funerária
            <small>{usuario.nome}</small>
          </span>
        </Link>

        {/* A ação principal fica no menu, e não só na tela de memoriais:
            publicar nota é o que a funerária abre o painel para fazer, e
            precisar navegar até a lista antes é um passo a mais no pior
            momento possível. */}
        <Link className="adm-lateral-acao" to="/memorial/novo">
          + Nova nota de falecimento
        </Link>

        <ul className="adm-lateral-lista">
          {DIA_A_DIA.map((s) => (
            <li key={s.para}>
              <Link
                to={s.para}
                className={
                  (s.exato ? pathname === s.para : pathname.startsWith(s.para))
                    ? 'adm-lateral-link adm-lateral-ativo'
                    : 'adm-lateral-link'
                }
                aria-current={
                  (s.exato ? pathname === s.para : pathname.startsWith(s.para))
                    ? 'page'
                    : undefined
                }
              >
                {s.rotulo}
              </Link>
            </li>
          ))}

          <li className="adm-lateral-sep" aria-hidden="true">
            Ajustes
          </li>

          {AJUSTES.map((s) => (
            <li key={s.para}>
              <Link
                to={s.para}
                className={
                  pathname.startsWith(s.para)
                    ? 'adm-lateral-link adm-lateral-ativo'
                    : 'adm-lateral-link'
                }
                aria-current={pathname.startsWith(s.para) ? 'page' : undefined}
              >
                {s.rotulo}
              </Link>
            </li>
          ))}
        </ul>

        <button className="adm-lateral-sair" onClick={sair}>
          Sair
        </button>
      </nav>

      <main className="adm-main">{children}</main>
    </div>
  )
}
