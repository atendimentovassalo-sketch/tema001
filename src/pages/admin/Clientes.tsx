/* Cadastro de clientes da funerária, com o plano funerário embutido.
 *
 * Escopo autorizado em 17/08/2026: controle de clientes e financeiro, sem nada
 * fiscal e sem estoque. Dimensionamento real da São Francisco: ~30 famílias com
 * plano — a tela é feita para dezenas de linhas, não para milhares, e por isso
 * não tem paginação nem busca no servidor.
 *
 * A tela abre na LISTA, não no formulário (ajuste de 18/08). Cadastrar cliente
 * novo é o que ela faz de vez em quando; consultar quem já existe é o que ela
 * faz toda semana.
 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { formatarReais, paraCentavos } from '@/lib/dinheiro'
import { linkWhatsApp } from '@/lib/whatsapp'
import { modelosAplicaveis } from '@/lib/modelosMensagem'
import { useSessao } from './auth'
import PainelShell from './PainelShell'
import './admin.css'

interface Cliente {
  id: string
  nome: string
  telefone: string | null
  documento: string | null
  endereco: string | null
  observacao: string | null
  planoAtivo: boolean
  planoValorCentavos: number | null
  planoDiaVencimento: number | null
  planoInicio: string | null
  ativo: boolean
}

interface MemorialResumo {
  id: string
  slug: string
  nomeCompleto: string
  status: string
}

interface LancamentoAberto {
  clienteId: string | null
  valorCentavos: number
  vencimento: string | null
}

const VAZIO = {
  nome: '',
  telefone: '',
  documento: '',
  endereco: '',
  observacao: '',
  planoAtivo: false,
  valor: '',
  diaVencimento: '10',
  planoInicio: '',
}

export default function AdminClientes() {
  const navigate = useNavigate()
  const { carregando, usuario } = useSessao()
  const [lista, setLista] = useState<Cliente[]>([])
  const [prontos, setProntos] = useState(false)
  const [busca, setBusca] = useState('')
  const [form, setForm] = useState({ ...VAZIO })
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [menuId, setMenuId] = useState<string | null>(null)
  const [abertos, setAbertos] = useState<LancamentoAberto[]>([])
  const [funeraria, setFuneraria] = useState('Funerária')
  const [diaPadrao, setDiaPadrao] = useState('10')
  const [memoriais, setMemoriais] = useState<MemorialResumo[]>([])
  const [submenu, setSubmenu] = useState<'pagina' | 'gestao' | null>(null)

  useEffect(() => {
    document.title = 'Clientes — Painel'
  }, [])

  useEffect(() => {
    if (!carregando && !usuario) navigate('/admin/login', { replace: true })
  }, [carregando, usuario, navigate])

  const recarregar = useCallback(async () => {
    const r = await api.get<{ clientes: Cliente[] }>('/api/admin/clientes')
    setLista(r.clientes)
    setProntos(true)
  }, [])

  useEffect(() => {
    if (usuario) recarregar().catch(() => setProntos(true))
  }, [usuario, recarregar])

  /* O que está em aberto por cliente alimenta os modelos de cobrança: mensagem
   * de cobrança sem o valor não serve para nada. */
  useEffect(() => {
    if (!usuario) return
    api
      .get<{ emAberto: LancamentoAberto[] }>('/api/admin/financeiro')
      .then((r) => setAbertos(r.emAberto))
      .catch(() => setAbertos([]))
    api
      .get<{ config?: { nome?: string; diaInicioCiclo?: number } }>(
        '/api/admin/config',
      )
      .then((r) => {
        if (r.config?.nome) setFuneraria(r.config.nome)
        if (r.config?.diaInicioCiclo)
          setDiaPadrao(String(r.config.diaInicioCiclo))
      })
      .catch(() => {})
    /* Os memoriais alimentam os dois modelos de link. Só os publicados: mandar
     * para a família o link de um rascunho é mandar uma página que não abre. */
    api
      .get<{ memoriais: MemorialResumo[] }>('/api/admin/memoriais')
      .then((r) =>
        setMemoriais(r.memoriais.filter((m) => m.status === 'publicado')),
      )
      .catch(() => setMemoriais([]))
  }, [usuario])

  const porCliente = useMemo(() => {
    const m = new Map<string, { total: number; vencimento: string | null }>()
    for (const l of abertos) {
      if (!l.clienteId) continue
      const a = m.get(l.clienteId) ?? { total: 0, vencimento: null }
      a.total += l.valorCentavos
      if (l.vencimento && (!a.vencimento || l.vencimento < a.vencimento))
        a.vencimento = l.vencimento
      m.set(l.clienteId, a)
    }
    return m
  }, [abertos])

  const filtrada = useMemo(() => {
    const t = busca.trim().toLowerCase()
    if (!t) return lista
    return lista.filter(
      (c) =>
        c.nome.toLowerCase().includes(t) ||
        (c.telefone ?? '').toLowerCase().includes(t) ||
        (c.documento ?? '').toLowerCase().includes(t),
    )
  }, [lista, busca])

  const comPlano = useMemo(() => lista.filter((c) => c.planoAtivo), [lista])
  const totalMensal = useMemo(
    () => comPlano.reduce((s, c) => s + (c.planoValorCentavos ?? 0), 0),
    [comPlano],
  )

  function limpar() {
    setForm({ ...VAZIO, diaVencimento: diaPadrao })
    setEditandoId(null)
    setMostrarForm(false)
  }

  function novo() {
    setForm({ ...VAZIO, diaVencimento: diaPadrao })
    setEditandoId(null)
    setMostrarForm(true)
  }

  function editar(c: Cliente) {
    setEditandoId(c.id)
    setMostrarForm(true)
    setMenuId(null)
    setForm({
      nome: c.nome,
      telefone: c.telefone ?? '',
      documento: c.documento ?? '',
      endereco: c.endereco ?? '',
      observacao: c.observacao ?? '',
      planoAtivo: c.planoAtivo,
      valor:
        c.planoValorCentavos != null
          ? (c.planoValorCentavos / 100).toFixed(2).replace('.', ',')
          : '',
      diaVencimento: String(c.planoDiaVencimento ?? diaPadrao),
      planoInicio: c.planoInicio ?? '',
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nome.trim()) {
      toast.error('Informe o nome do cliente.')
      return
    }
    let centavos: number | null = null
    if (form.planoAtivo) {
      centavos = paraCentavos(form.valor)
      if (centavos == null || centavos <= 0) {
        toast.error('Informe o valor da mensalidade do plano.')
        return
      }
    }
    setSalvando(true)
    const corpo = {
      nome: form.nome.trim(),
      telefone: form.telefone.trim() || null,
      documento: form.documento.trim() || null,
      endereco: form.endereco.trim() || null,
      observacao: form.observacao.trim() || null,
      planoAtivo: form.planoAtivo,
      planoValorCentavos: centavos,
      planoDiaVencimento: form.planoAtivo
        ? Number(form.diaVencimento) || 10
        : null,
      planoInicio:
        form.planoAtivo && form.planoInicio ? form.planoInicio : null,
    }
    try {
      if (editandoId) {
        await api.put(`/api/admin/clientes/${editandoId}`, corpo)
        toast.success('Cliente atualizado.')
      } else {
        await api.post('/api/admin/clientes', corpo)
        toast.success('Cliente cadastrado.')
      }
      limpar()
      await recarregar()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não deu para salvar.')
    } finally {
      setSalvando(false)
    }
  }

  async function arquivar(c: Cliente) {
    if (
      !confirm(
        `Arquivar ${c.nome}? O histórico financeiro dele continua guardado.`,
      )
    )
      return
    try {
      await api.del(`/api/admin/clientes/${c.id}`)
      toast.success('Cliente arquivado.')
      if (editandoId === c.id) limpar()
      await recarregar()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não deu para arquivar.')
    }
  }

  /* `noopener` porque a página aberta não tem motivo nenhum para alcançar esta. */
  function abrirWhats(url: string) {
    window.open(url, '_blank', 'noopener,noreferrer')
    setMenuId(null)
    setSubmenu(null)
  }

  /* Link da página: público, pode circular. */
  function mandarPagina(c: Cliente, m: MemorialResumo) {
    const url = `${window.location.origin}/m/${m.slug}`
    const texto =
      `Nota de falecimento de ${m.nomeCompleto}.

${url}

` +
      `Pode compartilhar à vontade — com a família, com amigos, em grupos.

— ${funeraria}`
    abrirWhats(linkWhatsApp(c.telefone, texto)!)
  }

  /* Link de gestão: gera na hora (invalidando o anterior) e já monta a mensagem
   * com o aviso. Sai daqui com o aviso embutido justamente porque este é o link
   * que não pode circular. */
  async function mandarGestao(c: Cliente, m: MemorialResumo) {
    try {
      const r = await api.post<{ ok: true; url: string; dias: number }>(
        `/api/admin/memoriais/${m.id}/familia`,
      )
      const texto =
        `Este link é para VOCÊ cuidar da página de ${m.nomeCompleto} — escrever a ` +
        `história, acrescentar fotos e aprovar ou esconder as mensagens que ` +
        `chegarem:
${r.url}

` +
        `⚠️ Por favor, NÃO repasse este link em grupos nem para outras pessoas. ` +
        `Ele não pede senha: quem tiver o endereço consegue alterar a página. ` +
        `Guarde só com você, ou com uma pessoa da família de sua confiança.

` +
        `Para divulgar o falecimento, use o outro link, o da página em si — esse ` +
        `pode circular à vontade.

` +
        `O acesso vale ${r.dias} dias.

— ${funeraria}`
      abrirWhats(linkWhatsApp(c.telefone, texto)!)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Não deu para gerar o link.')
    }
  }

  if (carregando || !usuario)
    return <div className="adm adm-carregando">Carregando…</div>

  return (
    <PainelShell usuario={usuario} titulo="Clientes">
      <>
        <div className="adm-acao-topo">
          <div>
            <h1>Clientes</h1>
            <p className="adm-sub">
              {lista.length > 0
                ? `${lista.length} cadastrados · ${comPlano.length} com plano · ${formatarReais(totalMensal)} por mês`
                : 'Cadastro das famílias atendidas e dos planos funerários.'}
            </p>
          </div>
          {!mostrarForm && (
            <button className="adm-btn adm-btn-primario" onClick={novo}>
              + Novo cliente
            </button>
          )}
        </div>

        {mostrarForm && (
          <section className="adm-bloco">
            <h2>{editandoId ? 'Editar cliente' : 'Novo cliente'}</h2>
            <form className="ges-form" onSubmit={salvar}>
              <label className="ges-campo ges-campo-largo">
                <span>Nome</span>
                <input
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  maxLength={160}
                  autoFocus
                  required
                />
              </label>
              <label className="ges-campo">
                <span>Telefone / WhatsApp</span>
                <input
                  value={form.telefone}
                  onChange={(e) =>
                    setForm({ ...form, telefone: e.target.value })
                  }
                  maxLength={40}
                  inputMode="tel"
                  placeholder="(45) 99128-4521"
                />
              </label>
              <label className="ges-campo">
                <span>CPF ou documento</span>
                <input
                  value={form.documento}
                  onChange={(e) =>
                    setForm({ ...form, documento: e.target.value })
                  }
                  maxLength={40}
                />
              </label>
              <label className="ges-campo ges-campo-largo">
                <span>Endereço</span>
                <input
                  value={form.endereco}
                  onChange={(e) =>
                    setForm({ ...form, endereco: e.target.value })
                  }
                  maxLength={240}
                />
              </label>

              <label className="ges-check">
                <input
                  type="checkbox"
                  checked={form.planoAtivo}
                  onChange={(e) =>
                    setForm({ ...form, planoAtivo: e.target.checked })
                  }
                />
                <span>Tem plano funerário</span>
              </label>

              {form.planoAtivo && (
                <>
                  <label className="ges-campo">
                    <span>Mensalidade</span>
                    <input
                      value={form.valor}
                      onChange={(e) =>
                        setForm({ ...form, valor: e.target.value })
                      }
                      placeholder="Ex.: 65,00"
                      inputMode="decimal"
                    />
                  </label>
                  <label className="ges-campo">
                    <span>Dia do vencimento</span>
                    <select
                      value={form.diaVencimento}
                      onChange={(e) =>
                        setForm({ ...form, diaVencimento: e.target.value })
                      }
                    >
                      {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="ges-campo">
                    <span>Início do plano</span>
                    <input
                      type="date"
                      value={form.planoInicio}
                      onChange={(e) =>
                        setForm({ ...form, planoInicio: e.target.value })
                      }
                    />
                  </label>
                </>
              )}

              <label className="ges-campo ges-campo-largo">
                <span>Observação</span>
                <textarea
                  value={form.observacao}
                  onChange={(e) =>
                    setForm({ ...form, observacao: e.target.value })
                  }
                  maxLength={1000}
                  rows={2}
                />
              </label>

              <div className="ges-form-acoes">
                <button
                  className="adm-btn adm-btn-primario"
                  disabled={salvando}
                >
                  {salvando
                    ? 'Salvando…'
                    : editandoId
                      ? 'Salvar alterações'
                      : 'Cadastrar'}
                </button>
                <button
                  type="button"
                  className="adm-btn adm-btn-fantasma"
                  onClick={limpar}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="adm-bloco">
          <input
            className="ges-busca"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome, telefone ou documento"
            aria-label="Buscar cliente"
          />
          {!prontos ? (
            <p className="adm-vazio">Carregando…</p>
          ) : filtrada.length === 0 ? (
            <p className="adm-vazio">
              {lista.length === 0 ? (
                <>
                  Nenhum cliente cadastrado ainda.{' '}
                  <button className="adm-link" onClick={novo}>
                    Cadastrar o primeiro
                  </button>
                </>
              ) : (
                'Nenhum cliente encontrado com esse termo.'
              )}
            </p>
          ) : (
            <ul className="ges-lista">
              {filtrada.map((c) => {
                const aberto = porCliente.get(c.id)
                const dados = {
                  clienteNome: c.nome,
                  funeraria,
                  emAbertoCentavos: aberto?.total ?? 0,
                  vencimento: aberto?.vencimento ?? null,
                }
                const modelos = modelosAplicaveis(dados)
                const zap = linkWhatsApp(c.telefone)
                return (
                  <li key={c.id}>
                    <div className="ges-lista-txt">
                      <strong>{c.nome}</strong>
                      <span className="ges-meta">
                        {[c.telefone, c.documento]
                          .filter(Boolean)
                          .join(' · ') || 'sem contato'}
                      </span>
                      {c.planoAtivo && c.planoValorCentavos != null && (
                        <span className="ges-plano">
                          plano {formatarReais(c.planoValorCentavos)}/mês
                          {c.planoDiaVencimento
                            ? ` · vence dia ${c.planoDiaVencimento}`
                            : ''}
                        </span>
                      )}
                      {aberto && aberto.total > 0 && (
                        <span className="ges-devendo">
                          {formatarReais(aberto.total)} em aberto
                        </span>
                      )}
                    </div>

                    <div className="adm-pend-acoes">
                      {zap ? (
                        <>
                          <button
                            className="adm-btn adm-btn-mini cli-zap"
                            onClick={() => abrirWhats(zap)}
                            title={`Abrir conversa com ${c.nome}`}
                          >
                            WhatsApp
                          </button>
                          <div className="cli-menu-wrap">
                            <button
                              className="adm-btn adm-btn-mini adm-btn-fantasma"
                              onClick={() =>
                                setMenuId(menuId === c.id ? null : c.id)
                              }
                              aria-expanded={menuId === c.id}
                            >
                              Mensagem ▾
                            </button>
                            {menuId === c.id && (
                              <div className="cli-menu" role="menu">
                                {modelos.map(({ modelo, texto }) => (
                                  <button
                                    key={modelo.id}
                                    role="menuitem"
                                    onClick={() =>
                                      abrirWhats(
                                        linkWhatsApp(c.telefone, texto)!,
                                      )
                                    }
                                  >
                                    {modelo.rotulo}
                                  </button>
                                ))}
                                {modelos.length === 0 && (
                                  <span className="cli-menu-vazio">
                                    Nada em aberto para cobrar.
                                  </span>
                                )}
                                {memoriais.length > 0 && (
                                  <>
                                    <button
                                      role="menuitem"
                                      className="cli-menu-sep"
                                      onClick={() =>
                                        setSubmenu(
                                          submenu === 'pagina'
                                            ? null
                                            : 'pagina',
                                        )
                                      }
                                    >
                                      Link da página do memorial ▸
                                    </button>
                                    {submenu === 'pagina' &&
                                      memoriais.map((m) => (
                                        <button
                                          key={m.id}
                                          role="menuitem"
                                          className="cli-menu-sub"
                                          onClick={() => mandarPagina(c, m)}
                                        >
                                          {m.nomeCompleto}
                                        </button>
                                      ))}

                                    <button
                                      role="menuitem"
                                      onClick={() =>
                                        setSubmenu(
                                          submenu === 'gestao'
                                            ? null
                                            : 'gestao',
                                        )
                                      }
                                    >
                                      Link de gestão (não compartilhar) ▸
                                    </button>
                                    {submenu === 'gestao' &&
                                      memoriais.map((m) => (
                                        <button
                                          key={m.id}
                                          role="menuitem"
                                          className="cli-menu-sub"
                                          onClick={() => mandarGestao(c, m)}
                                        >
                                          {m.nomeCompleto}
                                        </button>
                                      ))}
                                  </>
                                )}
                                <button
                                  role="menuitem"
                                  className="cli-menu-sep"
                                  onClick={() => abrirWhats(zap)}
                                >
                                  Escrever do zero
                                </button>
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        <span
                          className="ges-meta"
                          title="Cadastre um telefone válido para liberar o WhatsApp"
                        >
                          sem WhatsApp
                        </span>
                      )}
                      <button
                        className="adm-btn adm-btn-mini adm-btn-fantasma"
                        onClick={() => editar(c)}
                      >
                        Editar
                      </button>
                      <button
                        className="adm-btn adm-btn-mini adm-btn-fantasma"
                        onClick={() => arquivar(c)}
                      >
                        Arquivar
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </>
    </PainelShell>
  )
}
