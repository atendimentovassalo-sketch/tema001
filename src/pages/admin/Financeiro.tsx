/* Financeiro: visão geral do mês + lançamentos + o que está em aberto.
 *
 * A "visão geral" mora no topo desta tela, e não numa terceira página: a
 * pergunta que a dona faz ("como está o mês?") e a ação que ela toma ("marcar
 * quem pagou") são o mesmo momento. Separar em duas telas obrigaria a navegar
 * de uma para a outra a cada linha.
 *
 * O bloco "em aberto" ignora a competência escolhida de propósito: "quem me
 * deve?" não respeita fronteira de mês — a mensalidade de julho que ninguém
 * pagou tem de aparecer enquanto se olha agosto. */
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import {
  formatarReais,
  paraCentavos,
  nomeCompetencia,
  formatarData,
  hojeISO,
  competenciaAtual,
  competenciaDoCiclo,
  intervaloDoCiclo,
  deslocarCompetencia,
} from '@/lib/dinheiro'
import { useSessao } from './auth'
import PainelShell from './PainelShell'
import RelatorioContador from './RelatorioContador'
import './admin.css'

interface Lancamento {
  id: string
  clienteId: string | null
  clienteNome: string | null
  tipo: 'entrada' | 'saida'
  categoria: string
  descricao: string | null
  valorCentavos: number
  competencia: string
  vencimento: string | null
  pagoEm: string | null
  parcelaNum: number | null
  parcelaDe: number | null
}

interface Resumo {
  competencia: string
  entradasCentavos: number
  saidasCentavos: number
  recebidoCentavos: number
  aReceberCentavos: number
  clientesComPlano: number
}

interface Cliente {
  id: string
  nome: string
}

const CATEGORIAS_ENTRADA = ['atendimento', 'mensalidade', 'outra']
const CATEGORIAS_SAIDA = [
  'fornecedor',
  'veículo',
  'salário',
  'imposto',
  'outra',
]

export default function AdminFinanceiro() {
  const navigate = useNavigate()
  const { carregando, usuario } = useSessao()

  const [competencia, setCompetencia] = useState(competenciaAtual())
  const [resumo, setResumo] = useState<Resumo | null>(null)
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([])
  const [emAberto, setEmAberto] = useState<Lancamento[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [prontos, setProntos] = useState(false)
  const [nomeFuneraria, setNomeFuneraria] = useState('Funerária')
  const [diaInicio, setDiaInicio] = useState(1)
  const [salvando, setSalvando] = useState(false)
  /* Filtros da lista do mês. Não vão para a API: são dezenas de linhas por mês
   * (0–10 atendimentos + ~30 mensalidades), então filtrar no cliente é instantâneo
   * e evita uma ida ao servidor a cada clique. */
  const [fTipo, setFTipo] = useState<'todos' | 'entrada' | 'saida'>('todos')
  const [fStatus, setFStatus] = useState<
    'todos' | 'pagas' | 'aberto' | 'atrasadas'
  >('todos')

  const [form, setForm] = useState({
    tipo: 'entrada' as 'entrada' | 'saida',
    categoria: 'atendimento',
    clienteId: '',
    descricao: '',
    valor: '',
    jaPago: true,
    /* Parcelado: `valor` passa a ser o de CADA mês. É como a dona fala ("seis
     * vezes de quinhentos") e como o carnê é escrito — pedir o total e dividir
     * dá dízima e centavo perdido. */
    parcelado: false,
    parcelas: '2',
  })

  useEffect(() => {
    document.title = 'Financeiro — Painel'
  }, [])

  useEffect(() => {
    if (!carregando && !usuario) navigate('/admin/login', { replace: true })
  }, [carregando, usuario, navigate])

  const recarregar = useCallback(async () => {
    const r = await api.get<{
      competencia: string
      resumo: Resumo
      lancamentos: Lancamento[]
      emAberto: Lancamento[]
    }>(`/api/admin/financeiro?competencia=${competencia}`)
    setResumo(r.resumo)
    setLancamentos(r.lancamentos)
    setEmAberto(r.emAberto)
    setProntos(true)
  }, [competencia])

  useEffect(() => {
    if (usuario) recarregar().catch(() => setProntos(true))
  }, [usuario, recarregar])

  /* Nome do tenant para o cabeçalho do relatório impresso: o contador recebe
   * um PDF solto, e papel sem remetente não serve de nada. */
  useEffect(() => {
    if (!usuario) return
    api
      .get<{ config?: { nome?: string; diaInicioCiclo?: number } }>(
        '/api/admin/config',
      )
      .then((r) => {
        if (r.config?.nome) setNomeFuneraria(r.config.nome)
        if (r.config?.diaInicioCiclo) {
          setDiaInicio(r.config.diaInicioCiclo)
          /* Reposiciona no mês do ciclo dela — mas só enquanto ninguém navegou,
           * senão o clique em "mês anterior" seria desfeito ao carregar. */
          setCompetencia((c) =>
            c === competenciaAtual()
              ? competenciaDoCiclo(r.config!.diaInicioCiclo!)
              : c,
          )
        }
      })
      .catch(() => {})
  }, [usuario])

  useEffect(() => {
    if (!usuario) return
    api
      .get<{ clientes: Cliente[] }>('/api/admin/clientes')
      .then((r) => setClientes(r.clientes))
      .catch(() => setClientes([]))
  }, [usuario])

  async function lancar(e: React.FormEvent) {
    e.preventDefault()
    const centavos = paraCentavos(form.valor)
    if (centavos == null || centavos <= 0) {
      toast.error('Informe um valor válido.')
      return
    }
    setSalvando(true)
    try {
      const parcelas = form.parcelado ? Number(form.parcelas) : 1
      if (form.parcelado && (!Number.isInteger(parcelas) || parcelas < 2)) {
        toast.error('Informe de 2 a 60 parcelas.')
        setSalvando(false)
        return
      }
      await api.post('/api/admin/financeiro', {
        clienteId: form.clienteId || null,
        tipo: form.tipo,
        categoria: form.categoria,
        descricao: form.descricao.trim() || null,
        valorCentavos: centavos,
        competencia,
        vencimento: null,
        pagoEm: form.jaPago ? hojeISO() : null,
        parcelas,
      })
      toast.success(
        parcelas > 1
          ? `${parcelas} parcelas de ${formatarReais(centavos)} lançadas, uma por mês.`
          : 'Lançamento registrado.',
      )
      setForm({ ...form, descricao: '', valor: '', clienteId: '' })
      await recarregar()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não deu para lançar.')
    } finally {
      setSalvando(false)
    }
  }

  async function alternarPago(l: Lancamento) {
    try {
      await api.patch(`/api/admin/financeiro/${l.id}`, {
        pagoEm: l.pagoEm ? null : hojeISO(),
      })
      await recarregar()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Não deu para atualizar.',
      )
    }
  }

  async function excluir(l: Lancamento) {
    if (!confirm('Excluir este lançamento?')) return
    try {
      await api.del(`/api/admin/financeiro/${l.id}`)
      toast.success('Lançamento excluído.')
      await recarregar()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não deu para excluir.')
    }
  }

  async function gerarMensalidades() {
    try {
      const r = await api.post<{ ok: true; criados: number }>(
        '/api/admin/financeiro/mensalidades',
        { competencia },
      )
      toast.success(
        r.criados > 0
          ? `${r.criados} mensalidade(s) geradas.`
          : 'Nenhuma mensalidade nova — as deste mês já estavam lançadas.',
      )
      await recarregar()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não deu para gerar.')
    }
  }

  if (carregando || !usuario)
    return <div className="adm adm-carregando">Carregando…</div>

  /* Janela do seletor: 24 meses para trás e 2 para frente, a partir do mês
   * corrente do ciclo. Para frente basta pouco (lançar algo já datado), e para
   * trás cobre dois anos de histórico sem virar uma lista infinita.
   * A competência aberta entra na lista mesmo se cair fora da janela — senão o
   * `select` ficaria sem opção correspondente e mostraria a errada. */
  const mesCorrente = competenciaDoCiclo(diaInicio)
  const mesesDisponiveis = (() => {
    const lista: string[] = []
    for (let i = 2; i >= -24; i--)
      lista.push(deslocarCompetencia(mesCorrente, i))
    if (!lista.includes(competencia)) {
      lista.push(competencia)
      lista.sort().reverse()
    }
    return lista
  })()

  const hoje = hojeISO()
  const lancamentosFiltrados = lancamentos.filter((l) => {
    if (fTipo !== 'todos' && l.tipo !== fTipo) return false
    if (fStatus === 'pagas') return !!l.pagoEm
    if (fStatus === 'aberto') return !l.pagoEm
    if (fStatus === 'atrasadas')
      return !l.pagoEm && !!l.vencimento && l.vencimento < hoje
    return true
  })

  /* Prévia em uma linha: quanto, em quantas vezes, de que mês a que mês. Sem
     isto a dona só descobre onde as parcelas caíram depois de gravar 6 linhas. */
  const resumoDoParcelamento = (() => {
    const n = Number(form.parcelas)
    const centavos = paraCentavos(form.valor)
    if (!Number.isInteger(n) || n < 2) return 'Informe de 2 a 60 parcelas.'
    if (centavos == null || centavos <= 0)
      return `${n} parcelas — informe o valor de cada uma.`
    const ultima = deslocarCompetencia(competencia, n - 1)
    return `${n}x de ${formatarReais(centavos)} — total ${formatarReais(
      centavos * n,
    )}, de ${nomeCompetencia(competencia)} a ${nomeCompetencia(ultima)}.`
  })()

  const saldo = resumo ? resumo.recebidoCentavos - resumo.saidasCentavos : 0
  const categorias =
    form.tipo === 'entrada' ? CATEGORIAS_ENTRADA : CATEGORIAS_SAIDA
  const atrasados = emAberto.filter(
    (l) => l.vencimento && l.vencimento < hojeISO(),
  )

  return (
    <PainelShell usuario={usuario} titulo="Financeiro">
      <>
        <div className="adm-acao-topo">
          <div>
            <h1>Financeiro</h1>
            <p className="adm-sub">
              {nomeCompetencia(competencia)}
              {intervaloDoCiclo(competencia, diaInicio) && (
                <> · ciclo de {intervaloDoCiclo(competencia, diaInicio)}</>
              )}
            </p>
          </div>
          <div className="ges-mes">
            <button
              className="adm-btn adm-btn-fantasma adm-btn-mini"
              onClick={() =>
                setCompetencia(deslocarCompetencia(competencia, -1))
              }
              aria-label="Mês anterior"
            >
              ←
            </button>

            {/* Seletor com o nome do mês, em vez de um botão fixo "Mês atual".
                Pular de agosto para março com a seta custa cinco cliques; e sem
                o nome escrito no controle, a pessoa precisa conferir o subtítulo
                para saber onde está. O mês corrente vem marcado no próprio
                rótulo — assim o controle diz onde você está E deixa escolher. */}
            <select
              className="ges-mes-sel"
              value={competencia}
              onChange={(e) => setCompetencia(e.target.value)}
              aria-label="Escolher o mês"
            >
              {mesesDisponiveis.map((m) => (
                <option key={m} value={m}>
                  {m === mesCorrente
                    ? `${nomeCompetencia(m)} (mês atual)`
                    : nomeCompetencia(m)}
                </option>
              ))}
            </select>

            <button
              className="adm-btn adm-btn-fantasma adm-btn-mini"
              onClick={() =>
                setCompetencia(deslocarCompetencia(competencia, 1))
              }
              aria-label="Próximo mês"
            >
              →
            </button>

            {/* Só aparece quando faz diferença: fora do mês corrente. Botão que
                não faz nada onde está é ruído. */}
            {competencia !== mesCorrente && (
              <button
                className="adm-btn adm-btn-fantasma adm-btn-mini"
                onClick={() => setCompetencia(mesCorrente)}
              >
                Voltar ao mês atual
              </button>
            )}
          </div>
        </div>

        <section className="adm-bloco">
          <h2>Visão geral</h2>
          <div className="ges-cartoes">
            <div className="ges-cartao">
              <span className="ges-cartao-rot">Recebido</span>
              <strong className="ges-cartao-val">
                {formatarReais(resumo?.recebidoCentavos ?? 0)}
              </strong>
            </div>
            <div className="ges-cartao">
              <span className="ges-cartao-rot">A receber</span>
              <strong className="ges-cartao-val">
                {formatarReais(resumo?.aReceberCentavos ?? 0)}
              </strong>
            </div>
            <div className="ges-cartao">
              <span className="ges-cartao-rot">Saídas</span>
              <strong className="ges-cartao-val">
                {formatarReais(resumo?.saidasCentavos ?? 0)}
              </strong>
            </div>
            <div className="ges-cartao ges-cartao-saldo">
              <span className="ges-cartao-rot">Saldo do mês</span>
              <strong className="ges-cartao-val">{formatarReais(saldo)}</strong>
            </div>
          </div>
          <p className="adm-dica">
            Saldo considera o que já entrou de fato, não o que ainda está a
            receber.
          </p>
        </section>

        <section className="adm-bloco">
          <h2>Novo lançamento</h2>
          <form className="ges-form" onSubmit={lancar}>
            <label className="ges-campo">
              <span>Tipo</span>
              <select
                value={form.tipo}
                onChange={(e) => {
                  const tipo = e.target.value as 'entrada' | 'saida'
                  setForm({
                    ...form,
                    tipo,
                    categoria:
                      tipo === 'entrada' ? 'atendimento' : 'fornecedor',
                  })
                }}
              >
                <option value="entrada">Entrada</option>
                <option value="saida">Saída</option>
              </select>
            </label>
            <label className="ges-campo">
              <span>Categoria</span>
              <select
                value={form.categoria}
                onChange={(e) =>
                  setForm({ ...form, categoria: e.target.value })
                }
              >
                {categorias.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="ges-campo">
              <span>{form.parcelado ? 'Valor de cada parcela' : 'Valor'}</span>
              <input
                value={form.valor}
                onChange={(e) => setForm({ ...form, valor: e.target.value })}
                placeholder={form.parcelado ? 'Ex.: 500,00' : 'Ex.: 6.000,00'}
                inputMode="decimal"
              />
            </label>
            <label className="ges-campo">
              <span>Pagamento</span>
              <select
                value={form.parcelado ? 'parcelado' : 'vista'}
                onChange={(e) =>
                  setForm({
                    ...form,
                    parcelado: e.target.value === 'parcelado',
                  })
                }
              >
                <option value="vista">À vista</option>
                <option value="parcelado">Parcelado</option>
              </select>
            </label>
            {form.parcelado && (
              <label className="ges-campo">
                <span>Nº de parcelas</span>
                <input
                  value={form.parcelas}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      parcelas: e.target.value.replace(/\D/g, '').slice(0, 2),
                    })
                  }
                  inputMode="numeric"
                  placeholder="6"
                />
              </label>
            )}
            {form.tipo === 'entrada' && (
              <label className="ges-campo">
                <span>Cliente (opcional)</span>
                <select
                  value={form.clienteId}
                  onChange={(e) =>
                    setForm({ ...form, clienteId: e.target.value })
                  }
                >
                  <option value="">—</option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <label className="ges-campo ges-campo-largo">
              <span>Descrição</span>
              <input
                value={form.descricao}
                onChange={(e) =>
                  setForm({ ...form, descricao: e.target.value })
                }
                maxLength={240}
                placeholder="Ex.: funeral completo — família Silva"
              />
            </label>
            <label className="ges-check">
              <input
                type="checkbox"
                checked={form.jaPago}
                onChange={(e) => setForm({ ...form, jaPago: e.target.checked })}
              />
              <span>
                {form.parcelado ? 'A 1ª parcela já foi paga' : 'Já foi pago'}
              </span>
            </label>
            {form.parcelado && (
              <p className="ges-previa-parcelas">{resumoDoParcelamento}</p>
            )}
            <div className="ges-form-acoes">
              <button className="adm-btn adm-btn-primario" disabled={salvando}>
                {salvando ? 'Lançando…' : 'Lançar'}
              </button>
              <button
                type="button"
                className="adm-btn adm-btn-fantasma"
                onClick={gerarMensalidades}
                title="Cria as mensalidades deste mês para todo plano ativo. Pode clicar mais de uma vez sem duplicar."
              >
                Gerar mensalidades do mês
              </button>
            </div>
          </form>
        </section>

        {emAberto.length > 0 && (
          <section className="adm-bloco">
            <h2>
              Em aberto <span className="adm-tag">{emAberto.length}</span>
            </h2>
            {atrasados.length > 0 && (
              <p className="adm-dica">
                {atrasados.length} já passou do vencimento.
              </p>
            )}
            <ul className="ges-lista">
              {emAberto.map((l) => (
                <li key={l.id}>
                  <div className="ges-lista-txt">
                    <strong>
                      {l.clienteNome ?? l.descricao ?? l.categoria}
                      {l.parcelaDe ? (
                        <span className="ges-parcela">
                          {l.parcelaNum}/{l.parcelaDe}
                        </span>
                      ) : null}
                    </strong>
                    <span className="ges-meta">
                      {l.categoria} · {nomeCompetencia(l.competencia)}
                      {l.vencimento
                        ? ` · vence ${formatarData(l.vencimento)}`
                        : ''}
                      {l.vencimento && l.vencimento < hojeISO()
                        ? ' · atrasado'
                        : ''}
                    </span>
                  </div>
                  <div className="adm-pend-acoes">
                    <strong className="ges-valor">
                      {formatarReais(l.valorCentavos)}
                    </strong>
                    <button
                      className="adm-btn adm-btn-mini adm-btn-primario"
                      onClick={() => alternarPago(l)}
                    >
                      Recebi
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="adm-bloco">
          <h2>
            Lançamentos do mês{' '}
            <span className="adm-tag">{lancamentos.length}</span>
          </h2>
          {!prontos ? (
            <p className="adm-vazio">Carregando…</p>
          ) : lancamentos.length === 0 ? (
            <p className="adm-vazio">Nada lançado neste mês ainda.</p>
          ) : lancamentosFiltrados.length === 0 ? (
            <p className="adm-vazio">Nenhum lançamento com esse filtro.</p>
          ) : (
            <ul className="ges-lista">
              {lancamentosFiltrados.map((l) => (
                <li key={l.id}>
                  <div className="ges-lista-txt">
                    <strong>
                      {l.descricao ?? l.clienteNome ?? l.categoria}
                      {l.parcelaDe ? (
                        <span className="ges-parcela">
                          {l.parcelaNum}/{l.parcelaDe}
                        </span>
                      ) : null}
                    </strong>
                    <span className="ges-meta">
                      {l.tipo === 'entrada' ? 'entrada' : 'saída'} ·{' '}
                      {l.categoria}
                      {l.clienteNome ? ` · ${l.clienteNome}` : ''}
                      {l.pagoEm
                        ? ` · pago em ${formatarData(l.pagoEm)}`
                        : ' · em aberto'}
                    </span>
                  </div>
                  <div className="adm-pend-acoes">
                    <strong
                      className={
                        l.tipo === 'entrada'
                          ? 'ges-valor ges-valor-in'
                          : 'ges-valor ges-valor-out'
                      }
                    >
                      {l.tipo === 'entrada' ? '+' : '−'}{' '}
                      {formatarReais(l.valorCentavos)}
                    </strong>
                    <button
                      className="adm-btn adm-btn-mini adm-btn-fantasma"
                      onClick={() => alternarPago(l)}
                    >
                      {l.pagoEm ? 'Reabrir' : 'Marcar pago'}
                    </button>
                    <button
                      className="adm-btn adm-btn-mini adm-btn-fantasma"
                      onClick={() => excluir(l)}
                    >
                      Excluir
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
        <RelatorioContador
          competencia={competencia}
          lancamentos={lancamentos}
          nomeFuneraria={nomeFuneraria}
        />
      </>
    </PainelShell>
  )
}
