/* Cadastro de clientes da funerária, com o plano funerário embutido.
 *
 * Escopo autorizado em 17/08/2026: controle de clientes e financeiro, sem nada
 * fiscal e sem estoque. Dimensionamento real da São Francisco: ~30 famílias com
 * plano — a tela é feita para dezenas de linhas, não para milhares, e por isso
 * não tem paginação nem busca no servidor. */
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { formatarReais, paraCentavos } from '@/lib/dinheiro'
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
  const [salvando, setSalvando] = useState(false)

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
    setForm({ ...VAZIO })
    setEditandoId(null)
  }

  function editar(c: Cliente) {
    setEditandoId(c.id)
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
      diaVencimento: String(c.planoDiaVencimento ?? 10),
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

  if (carregando || !usuario)
    return <div className="adm adm-carregando">Carregando…</div>

  return (
    <PainelShell usuario={usuario} titulo="Clientes">
      <>
        <div className="adm-acao-topo">
          <div>
            <h1>Clientes</h1>
            <p className="adm-sub">
              {comPlano.length > 0
                ? `${comPlano.length} com plano ativo · ${formatarReais(totalMensal)} por mês`
                : 'Cadastro das famílias atendidas e dos planos funerários.'}
            </p>
          </div>
        </div>

        <section className="adm-bloco">
          <h2>{editandoId ? 'Editar cliente' : 'Novo cliente'}</h2>
          <form className="ges-form" onSubmit={salvar}>
            <label className="ges-campo ges-campo-largo">
              <span>Nome</span>
              <input
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                maxLength={160}
                required
              />
            </label>
            <label className="ges-campo">
              <span>Telefone</span>
              <input
                value={form.telefone}
                onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                maxLength={40}
                inputMode="tel"
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
                onChange={(e) => setForm({ ...form, endereco: e.target.value })}
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
              <button className="adm-btn adm-btn-primario" disabled={salvando}>
                {salvando
                  ? 'Salvando…'
                  : editandoId
                    ? 'Salvar alterações'
                    : 'Cadastrar'}
              </button>
              {editandoId && (
                <button
                  type="button"
                  className="adm-btn adm-btn-fantasma"
                  onClick={limpar}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="adm-bloco">
          <h2>
            Cadastrados <span className="adm-tag">{lista.length}</span>
          </h2>
          <input
            className="ges-busca"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome, telefone ou documento"
          />
          {!prontos ? (
            <p className="adm-vazio">Carregando…</p>
          ) : filtrada.length === 0 ? (
            <p className="adm-vazio">
              {lista.length === 0
                ? 'Nenhum cliente cadastrado ainda.'
                : 'Nenhum cliente encontrado com esse termo.'}
            </p>
          ) : (
            <ul className="ges-lista">
              {filtrada.map((c) => (
                <li key={c.id}>
                  <div className="ges-lista-txt">
                    <strong>{c.nome}</strong>
                    <span className="ges-meta">
                      {[c.telefone, c.documento].filter(Boolean).join(' · ') ||
                        'sem contato'}
                    </span>
                    {c.planoAtivo && c.planoValorCentavos != null && (
                      <span className="ges-plano">
                        plano {formatarReais(c.planoValorCentavos)}/mês
                        {c.planoDiaVencimento
                          ? ` · vence dia ${c.planoDiaVencimento}`
                          : ''}
                      </span>
                    )}
                  </div>
                  <div className="adm-pend-acoes">
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
              ))}
            </ul>
          )}
        </section>
      </>
    </PainelShell>
  )
}
