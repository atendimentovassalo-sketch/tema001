/* Quem tem acesso ao painel. A funerária cadastra, reenvia convite, desativa e
 * remove sozinha — sem depender de quem fez o site.
 * Regra de ouro: ninguém digita a senha de outra pessoa. O cadastro gera um
 * convite de uso único; a senha é definida pelo próprio convidado. */
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { api, ApiError } from '@/lib/api'
import { useSessao } from './auth'
import PainelShell from './PainelShell'
import { useFuneraria } from './marca'
import './admin.css'

interface Usuario {
  id: string
  nome: string
  email: string
  papel: string
  ativo: boolean
  temSenha: boolean
  conviteAtivo: boolean
  ultimoAcessoISO: string | null
  criadoEmISO: string
}

function quando(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso.includes('T') ? iso : iso.replace(' ', 'T') + 'Z')
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export default function AdminUsuarios() {
  const navigate = useNavigate()
  const { carregando, usuario } = useSessao()
  const funeraria = useFuneraria()
  const [lista, setLista] = useState<Usuario[]>([])
  const [euId, setEuId] = useState('')
  const [prontos, setProntos] = useState(false)
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [link, setLink] = useState<{ para: string; url: string } | null>(null)

  /* Filtra usuários do sistema, gestor do SaaS e reordena: proprietária primeiro. */
  const listaVisivel = lista
    .filter((u) => !u.email.includes('sistema') && u.papel !== 'sistema' && u.email !== 'equipeavassaladora@gmail.com')
    .sort((a, b) => {
      if (a.email === 'atendimento.vassalo@gmail.com') return -1
      if (b.email === 'atendimento.vassalo@gmail.com') return 1
      return 0
    })

  useEffect(() => {
    document.title = 'Usuários — Painel'
  }, [])

  useEffect(() => {
    if (!carregando && !usuario) navigate('/admin/login', { replace: true })
  }, [carregando, usuario, navigate])

  const recarregar = useCallback(async () => {
    const r = await api.get<{ usuarios: Usuario[]; euId: string }>(
      '/api/admin/usuarios',
    )
    setLista(r.usuarios)
    setEuId(r.euId)
    setProntos(true)
  }, [])

  useEffect(() => {
    if (usuario) recarregar().catch(() => setProntos(true))
  }, [usuario, recarregar])

  async function convidar(e: React.FormEvent) {
    e.preventDefault()
    setSalvando(true)
    try {
      const r = await api.post<{ ok: true; link: string }>(
        '/api/admin/usuarios',
        {
          nome,
          email,
        },
      )
      setLink({ para: nome, url: r.link })
      setNome('')
      setEmail('')
      toast.success('Convite criado e enviado por e-mail')
      await recarregar()
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : 'Não foi possível cadastrar.',
      )
    } finally {
      setSalvando(false)
    }
  }

  async function reenviar(u: Usuario) {
    try {
      const r = await api.put<{ ok: true; link?: string }>(
        `/api/admin/usuarios/${u.id}`,
        { reenviarConvite: true },
      )
      if (r.link) setLink({ para: u.nome, url: r.link })
      toast.success('Novo convite enviado')
      await recarregar()
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : 'Não foi possível reenviar.',
      )
    }
  }

  async function alternarAtivo(u: Usuario) {
    try {
      await api.put(`/api/admin/usuarios/${u.id}`, { ativo: !u.ativo })
      toast.success(u.ativo ? 'Acesso desativado' : 'Acesso reativado')
      await recarregar()
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : 'Não foi possível alterar.',
      )
    }
  }

  async function remover(u: Usuario) {
    if (
      !confirm(
        `Remover o acesso de ${u.nome}? Esta ação não pode ser desfeita.`,
      )
    )
      return
    try {
      await api.del(`/api/admin/usuarios/${u.id}`)
      toast.success('Acesso removido')
      await recarregar()
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : 'Não foi possível remover.',
      )
    }
  }

  function copiar(url: string) {
    navigator.clipboard
      ?.writeText(url)
      .then(() => toast.success('Link copiado'))
      .catch(() => toast.error('Copie manualmente o link abaixo.'))
  }

  if (carregando) return <div className="adm adm-carregando">Carregando…</div>
  if (!usuario) return null

  return (
    <PainelShell usuario={usuario} titulo="Usuários">
      <>
        <section className="adm-bloco">
          <h2>Cadastrar acesso</h2>
          <p className="adm-sub">
            A pessoa recebe um e-mail com um link de uso único e escolhe a
            própria senha. Ninguém, nem você, digita a senha de outra pessoa.
          </p>
          <form className="adm-form-usuario" onSubmit={convidar}>
            <label>
              <span className="adm-rot">Nome</span>
              <input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex.: Janete Borak"
                required
              />
            </label>
            <label>
              <span className="adm-rot">E-mail</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@exemplo.com"
                required
              />
            </label>
            <button className="adm-btn adm-btn-primario" disabled={salvando}>
              {salvando ? 'Cadastrando…' : 'Cadastrar e enviar convite'}
            </button>
          </form>

          {link && (
            <div className="adm-link-convite">
              <p>
                Link de primeiro acesso de <b>{link.para}</b> — vale 7 dias, uso
                único. Se o e-mail não chegar, mande este link por WhatsApp:
              </p>
              <code>{link.url}</code>
              <button
                type="button"
                className="adm-btn adm-btn-fantasma adm-btn-mini"
                onClick={() => copiar(link.url)}
              >
                Copiar link
              </button>
            </div>
          )}
        </section>

        <section className="adm-bloco">
          <h2>Quem tem acesso</h2>
          {!prontos ? (
            <p className="adm-vazio">Carregando…</p>
          ) : listaVisivel.length === 0 ? (
            <p className="adm-vazio">Nenhum usuário cadastrado.</p>
          ) : (
            <table className="adm-tabela">
              <thead>
                <tr>
                  <th>Pessoa</th>
                  <th>Situação</th>
                  <th>Último acesso</th>
                  <th className="adm-col-acoes">Ações</th>
                </tr>
              </thead>
              <tbody>
                {listaVisivel.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <span className="adm-nome">{u.nome}</span>
                      {u.id === euId && <span className="adm-eu">você</span>}
                      <br />
                      <small className="adm-email">{u.email}</small>
                    </td>
                    <td>
                      {!u.ativo ? (
                        <span className="adm-status off">Desativado</span>
                      ) : u.temSenha ? (
                        <span className="adm-status on">Ativo</span>
                      ) : u.conviteAtivo ? (
                        <span className="adm-status pend">
                          Convite pendente
                        </span>
                      ) : (
                        <span className="adm-status off">Convite expirado</span>
                      )}
                    </td>
                    <td>{quando(u.ultimoAcessoISO)}</td>
                    <td className="adm-col-acoes">
                      <button
                        type="button"
                        className="adm-btn adm-btn-fantasma adm-btn-mini"
                        onClick={() => reenviar(u)}
                      >
                        {u.temSenha ? 'Redefinir senha' : 'Reenviar convite'}
                      </button>
                      {u.id !== euId && (
                        <>
                          <button
                            type="button"
                            className="adm-btn adm-btn-fantasma adm-btn-mini"
                            onClick={() => alternarAtivo(u)}
                          >
                            {u.ativo ? 'Desativar' : 'Reativar'}
                          </button>
                          <button
                            type="button"
                            className="adm-link adm-link-perigo"
                            onClick={() => remover(u)}
                          >
                            Remover
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="adm-bloco">
          <h2>Suporte</h2>
          <p className="adm-sub">Precisa de ajuda? Entre em contato conosco:</p>
          <div style={{ display: 'flex', gap: '16px', marginTop: '16px', flexWrap: 'wrap' }}>
            {funeraria?.whatsapp && (
              <a
                href={`https://wa.me/${funeraria.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="adm-btn adm-btn-primario"
              >
                💬 WhatsApp: {funeraria.whatsapp}
              </a>
            )}
            {funeraria?.email && (
              <a
                href={`mailto:${funeraria.email}`}
                className="adm-btn adm-btn-fantasma"
              >
                📧 Email: {funeraria.email}
              </a>
            )}
            <a
              href="mailto:atendimento.vassalo@gmail.com"
              className="adm-btn adm-btn-fantasma"
            >
              📧 Suporte Técnico: atendimento.vassalo@gmail.com
            </a>
          </div>
        </section>
      </>
    </PainelShell>
  )
}
