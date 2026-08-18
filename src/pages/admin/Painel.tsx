/* Painel de acesso rápido: novo memorial em destaque, fila de moderação e
 * lista de memoriais (todos os status) com ações. */
import { Fragment, useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { useSessao } from './auth'
import PainelShell from './PainelShell'
import CompartilharMemorial from './CompartilharMemorial'
import { ddmm } from '../memorial/format'
import './admin.css'

interface MemorialItem {
  id: string
  slug: string
  nomeCompleto: string
  fotoUrl: string | null
  falecimentoISO: string
  status: string
  visitas: number
  pendentes: number
}
interface Pendente {
  id: string
  nome: string
  texto: string | null
  vela: boolean
  criadoEmISO: string
  memorialSlug: string
  memorialNome: string
}

export default function AdminPainel() {
  const navigate = useNavigate()
  const { carregando, usuario } = useSessao()
  const [memoriais, setMemoriais] = useState<MemorialItem[]>([])
  const [pendentes, setPendentes] = useState<Pendente[]>([])
  const [prontos, setProntos] = useState(false)
  const [compartilhando, setCompartilhando] = useState<string | null>(null)

  useEffect(() => {
    document.title = 'Painel — Funerária'
  }, [])

  useEffect(() => {
    if (!carregando && !usuario) navigate('/admin/login', { replace: true })
  }, [carregando, usuario, navigate])

  const recarregar = useCallback(async () => {
    const [m, p] = await Promise.all([
      api.get<{ memoriais: MemorialItem[] }>('/api/admin/memoriais'),
      api.get<{ pendentes: Pendente[] }>('/api/admin/homenagens/pendentes'),
    ])
    setMemoriais(m.memoriais)
    setPendentes(p.pendentes)
    setProntos(true)
  }, [])

  useEffect(() => {
    if (usuario) recarregar().catch(() => setProntos(true))
  }, [usuario, recarregar])

  async function moderar(id: string, acao: 'aprovar' | 'recusar') {
    await api.post(`/api/admin/homenagens/${id}/moderar`, { acao })
    toast.success(
      acao === 'aprovar' ? 'Homenagem publicada' : 'Homenagem recusada',
    )
    recarregar()
  }

  async function alternarPublicacao(m: MemorialItem) {
    const publicar = m.status !== 'publicado'
    await api.post(`/api/admin/memoriais/${m.id}/publicar`, { publicar })
    toast.success(publicar ? 'Memorial publicado' : 'Memorial despublicado')
    recarregar()
  }

  async function apagar(m: MemorialItem) {
    if (
      !confirm(
        `Apagar a nota de ${m.nomeCompleto}? Esta ação não pode ser desfeita.`,
      )
    )
      return
    await api.del(`/api/admin/memoriais/${m.id}`)
    toast.success('Memorial apagado')
    recarregar()
  }

  if (carregando || (usuario && !prontos)) {
    return <div className="adm adm-carregando">Carregando…</div>
  }
  if (!usuario) return null

  return (
    <PainelShell usuario={usuario} titulo="Memoriais">
      <>
        <div className="adm-acao-topo">
          <div>
            <h1>Memoriais</h1>
            <p className="adm-sub">
              {memoriais.length} {memoriais.length === 1 ? 'nota' : 'notas'} ·{' '}
              {memoriais.filter((m) => m.status === 'publicado').length} no ar
            </p>
          </div>
          <Link className="adm-btn adm-btn-primario" to="/memorial/novo">
            + Novo memorial
          </Link>
        </div>

        {pendentes.length > 0 && (
          <section className="adm-bloco adm-moderacao">
            <h2>
              Homenagens a aprovar{' '}
              <span className="adm-tag">{pendentes.length}</span>
            </h2>
            <ul className="adm-pendentes">
              {pendentes.map((p) => (
                <li key={p.id}>
                  <div className="adm-pend-txt">
                    <strong>{p.nome}</strong>{' '}
                    <span className="adm-pend-mem">em {p.memorialNome}</span>
                    <p>{p.texto ?? (p.vela ? 'Acendeu uma vela' : '—')}</p>
                  </div>
                  <div className="adm-pend-acoes">
                    <button
                      className="adm-btn adm-btn-mini adm-btn-primario"
                      onClick={() => moderar(p.id, 'aprovar')}
                    >
                      Aprovar
                    </button>
                    <button
                      className="adm-btn adm-btn-mini adm-btn-fantasma"
                      onClick={() => moderar(p.id, 'recusar')}
                    >
                      Recusar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="adm-bloco">
          {memoriais.length === 0 ? (
            <p className="adm-vazio">
              Nenhum memorial ainda. Comece publicando a primeira nota.
            </p>
          ) : (
            <table className="adm-tabela">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Falecimento</th>
                  <th>Situação</th>
                  <th>Visitas</th>
                  <th className="adm-col-acoes">Ações</th>
                </tr>
              </thead>
              <tbody>
                {memoriais.map((m) => (
                  <Fragment key={m.id}>
                    <tr>
                      <td className="adm-nome">
                        {m.nomeCompleto}
                        {m.pendentes > 0 && (
                          <span
                            className="adm-pend-dot"
                            title="Homenagens a aprovar"
                          >
                            {m.pendentes}
                          </span>
                        )}
                      </td>
                      <td className="num">{ddmm(m.falecimentoISO)}</td>
                      <td>
                        <span
                          className={`adm-status ${m.status === 'publicado' ? 'on' : 'off'}`}
                        >
                          {m.status === 'publicado' ? 'No ar' : 'Rascunho'}
                        </span>
                      </td>
                      <td className="num">
                        {m.visitas.toLocaleString('pt-BR')}
                      </td>
                      <td className="adm-col-acoes">
                        {m.status === 'publicado' && (
                          <a
                            className="adm-link"
                            href={`/m/${m.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Ver
                          </a>
                        )}
                        <Link
                          className="adm-link"
                          to={`/memorial/novo?id=${m.id}`}
                        >
                          Editar
                        </Link>
                        <button
                          className="adm-link"
                          onClick={() => alternarPublicacao(m)}
                        >
                          {m.status === 'publicado'
                            ? 'Despublicar'
                            : 'Publicar'}
                        </button>
                        <button
                          className="adm-link"
                          onClick={() =>
                            setCompartilhando(
                              compartilhando === m.id ? null : m.id,
                            )
                          }
                          aria-expanded={compartilhando === m.id}
                        >
                          Links
                        </button>
                        <button
                          className="adm-link adm-link-perigo"
                          onClick={() => apagar(m)}
                        >
                          Apagar
                        </button>
                      </td>
                    </tr>
                    {compartilhando === m.id && (
                      <tr className="adm-linha-links">
                        <td colSpan={5}>
                          <CompartilharMemorial
                            memorialId={m.id}
                            slug={m.slug}
                            nome={m.nomeCompleto}
                            publicado={m.status === 'publicado'}
                          />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </>
    </PainelShell>
  )
}
