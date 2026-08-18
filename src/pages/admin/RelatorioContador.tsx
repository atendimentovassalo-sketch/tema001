/* Relatório financeiro do mês, para a funerária mandar ao contador.
 *
 * Duas saídas, porque servem a dois destinos diferentes:
 *   - CSV, que o contador importa no sistema dele;
 *   - impressão (Salvar como PDF pelo próprio navegador), que é o que se
 *     encaminha por WhatsApp ou e-mail sem o outro lado precisar abrir planilha.
 *
 * A seleção item a item existe porque o mês real não é o mês contábil: entra
 * lançamento de teste, adiantamento que o contador pede à parte, doação da
 * família que não é receita. Quem sabe o que entra é a dona — o sistema não
 * adivinha, só facilita marcar.
 *
 * Nada aqui é "fechamento contábil": é extrato conferido por gente. O produto
 * não emite nota nem apura imposto, por decisão registrada em 17/08/2026.
 */
import { useEffect, useMemo, useState } from 'react'
import { api } from '@/lib/api'
import { formatarReais, formatarData, nomeCompetencia } from '@/lib/dinheiro'

export interface LancamentoRel {
  id: string
  clienteNome: string | null
  tipo: 'entrada' | 'saida'
  categoria: string
  descricao: string | null
  valorCentavos: number
  competencia: string
  vencimento: string | null
  pagoEm: string | null
}

/** Último dia do mês de uma competência, em 'AAAA-MM-DD'. Dia 0 do mês
 *  seguinte é o último do atual — resolve fevereiro e ano bissexto sem tabela. */
function fimDoMes(competencia: string): string {
  const [ano, mes] = competencia.split('-').map(Number)
  const d = new Date(Date.UTC(ano, mes, 0))
  return d.toISOString().slice(0, 10)
}

/** Valor em centavos -> "1234,56" (sem "R$", com vírgula decimal).
 *  O contador abre no Excel em pt-BR: ponto decimal viraria data ou texto. */
function valorCSV(centavos: number): string {
  return (centavos / 100).toFixed(2).replace('.', ',')
}

/** Campo de CSV com separador ';'. Aspas dobradas quando há aspas, ';' ou quebra. */
function campoCSV(v: string | null): string {
  const s = (v ?? '').replace(/\r?\n/g, ' ').trim()
  return /[";]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s
}

export default function RelatorioContador({
  competencia,
  lancamentos,
  nomeFuneraria,
}: {
  competencia: string
  lancamentos: LancamentoRel[]
  nomeFuneraria: string
}) {
  /* Guarda os DESMARCADOS, não os marcados: assim lançamento novo que aparecer
   * depois (ou ao trocar de mês) já nasce incluído, que é o esperado. */
  const [fora, setFora] = useState<Set<string>>(new Set())
  const [aberto, setAberto] = useState(false)

  /* Período livre. Nasce desligado: o mês fechado é o caso comum, e obrigar a
   * escolher duas datas para o que já está na tela seria atrito à toa. */
  const [porPeriodo, setPorPeriodo] = useState(false)
  const [de, setDe] = useState(`${competencia}-01`)
  const [ate, setAte] = useState(fimDoMes(competencia))
  const [doPeriodo, setDoPeriodo] = useState<LancamentoRel[]>([])
  const [buscando, setBuscando] = useState(false)
  const [erroPeriodo, setErroPeriodo] = useState<string | null>(null)

  /* Trocar o mês na tela reposiciona o intervalo sugerido — senão o período
   * fica preso no mês em que a pessoa abriu a página. */
  useEffect(() => {
    setDe(`${competencia}-01`)
    setAte(fimDoMes(competencia))
  }, [competencia])

  useEffect(() => {
    if (!porPeriodo) return
    if (de > ate) {
      setErroPeriodo('A data inicial não pode ser depois da final.')
      return
    }
    setErroPeriodo(null)
    setBuscando(true)
    let vivo = true
    api
      .get<{ lancamentos: LancamentoRel[] }>(
        `/api/admin/financeiro/periodo?de=${de}&ate=${ate}`,
      )
      .then((r) => vivo && setDoPeriodo(r.lancamentos))
      .catch(() => vivo && setErroPeriodo('Não deu para carregar o período.'))
      .finally(() => vivo && setBuscando(false))
    return () => {
      vivo = false
    }
  }, [porPeriodo, de, ate])

  const base = porPeriodo ? doPeriodo : lancamentos

  const incluidos = useMemo(
    () => base.filter((l) => !fora.has(l.id)),
    [base, fora],
  )

  const totais = useMemo(() => {
    let entradas = 0
    let saidas = 0
    for (const l of incluidos) {
      if (l.tipo === 'entrada') entradas += l.valorCentavos
      else saidas += l.valorCentavos
    }
    return { entradas, saidas, saldo: entradas - saidas }
  }, [incluidos])

  function alternar(id: string) {
    setFora((s) => {
      const n = new Set(s)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })
  }

  const marcarTodos = () => setFora(new Set())
  const desmarcarTodos = () => setFora(new Set(base.map((l) => l.id)))
  /* "Só o que foi pago" é o recorte que o contador costuma pedir: regime de
   * caixa. Continua sendo escolha, não regra do sistema. */
  const soPagos = () =>
    setFora(new Set(base.filter((l) => !l.pagoEm).map((l) => l.id)))

  function baixarCSV() {
    const linhas = [
      [
        'Data',
        'Tipo',
        'Categoria',
        'Descricao',
        'Cliente',
        'Valor',
        'Situacao',
      ].join(';'),
      ...incluidos.map((l) =>
        [
          campoCSV(formatarData(l.pagoEm ?? l.vencimento)),
          l.tipo === 'entrada' ? 'Entrada' : 'Saida',
          campoCSV(l.categoria),
          campoCSV(l.descricao),
          campoCSV(l.clienteNome),
          valorCSV(l.valorCentavos),
          l.pagoEm ? 'Pago' : 'Em aberto',
        ].join(';'),
      ),
      '',
      ['', '', '', '', 'Total entradas', valorCSV(totais.entradas), ''].join(
        ';',
      ),
      ['', '', '', '', 'Total saidas', valorCSV(totais.saidas), ''].join(';'),
      ['', '', '', '', 'Saldo', valorCSV(totais.saldo), ''].join(';'),
    ].join('\r\n')

    /* BOM na frente: sem ele o Excel em Windows abre o arquivo como Latin-1 e
     * "Funerária" vira "FunerÃ¡ria". */
    const blob = new Blob(['﻿' + linhas], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = porPeriodo
      ? `financeiro-${de}_a_${ate}.csv`
      : `financeiro-${competencia}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (lancamentos.length === 0 && !porPeriodo) return null

  return (
    <section className="adm-bloco">
      <h2>
        Relatório para o contador{' '}
        <span className="adm-tag">{incluidos.length}</span>
      </h2>
      <p className="adm-dica">
        Escolha o que entra e baixe em planilha, ou imprima para salvar em PDF e
        mandar por WhatsApp.
      </p>

      <label className="ges-check rel-periodo-liga">
        <input
          type="checkbox"
          checked={porPeriodo}
          onChange={(e) => setPorPeriodo(e.target.checked)}
        />
        <span>Usar um período em vez do mês fechado</span>
      </label>

      {porPeriodo && (
        <div className="rel-periodo">
          <label className="ges-campo">
            <span>De</span>
            <input
              type="date"
              value={de}
              onChange={(e) => setDe(e.target.value)}
            />
          </label>
          <label className="ges-campo">
            <span>Até</span>
            <input
              type="date"
              value={ate}
              onChange={(e) => setAte(e.target.value)}
            />
          </label>
          <p className="adm-dica rel-periodo-nota">
            {erroPeriodo
              ? erroPeriodo
              : buscando
                ? 'Carregando…'
                : `${base.length} lançamento(s) no período. Conta pela data de pagamento; o que está em aberto entra pela data de vencimento.`}
          </p>
        </div>
      )}

      <div className="rel-acoes">
        <button
          className="adm-btn adm-btn-fantasma adm-btn-mini"
          onClick={() => setAberto((v) => !v)}
          aria-expanded={aberto}
        >
          {aberto ? 'Esconder a lista' : 'Escolher o que entra'}
        </button>
        <button className="adm-btn adm-btn-primario" onClick={baixarCSV}>
          Baixar planilha (CSV)
        </button>
        <button
          className="adm-btn adm-btn-fantasma"
          onClick={() => window.print()}
        >
          Imprimir / salvar PDF
        </button>
      </div>

      {aberto && (
        <>
          <div className="rel-atalhos">
            <button className="adm-link" onClick={marcarTodos}>
              Marcar todos
            </button>
            <button className="adm-link" onClick={soPagos}>
              Só o que foi pago
            </button>
            <button className="adm-link" onClick={desmarcarTodos}>
              Desmarcar todos
            </button>
          </div>
          <ul className="rel-lista">
            {base.map((l) => (
              <li key={l.id}>
                <label>
                  <input
                    type="checkbox"
                    checked={!fora.has(l.id)}
                    onChange={() => alternar(l.id)}
                  />
                  <span className="rel-lista-txt">
                    <strong>
                      {l.descricao ?? l.clienteNome ?? l.categoria}
                    </strong>
                    <span className="ges-meta">
                      {l.tipo === 'entrada' ? 'entrada' : 'saída'} ·{' '}
                      {l.categoria}
                      {l.pagoEm
                        ? ` · pago em ${formatarData(l.pagoEm)}`
                        : ' · em aberto'}
                    </span>
                  </span>
                  <strong className="ges-valor">
                    {formatarReais(l.valorCentavos)}
                  </strong>
                </label>
              </li>
            ))}
          </ul>
        </>
      )}

      <div className="rel-totais">
        <span>
          Entradas <strong>{formatarReais(totais.entradas)}</strong>
        </span>
        <span>
          Saídas <strong>{formatarReais(totais.saidas)}</strong>
        </span>
        <span className="rel-total-saldo">
          Saldo <strong>{formatarReais(totais.saldo)}</strong>
        </span>
      </div>

      {/* Só aparece na impressão. Fica no DOM em vez de abrir janela nova
          porque bloqueador de pop-up mata window.open() sem avisar. */}
      <div className="rel-imprimivel">
        <h1>{nomeFuneraria}</h1>
        <p className="rel-imp-sub">
          Relatório financeiro —{' '}
          {porPeriodo
            ? `${formatarData(de)} a ${formatarData(ate)}`
            : nomeCompetencia(competencia)}
        </p>
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Descrição</th>
              <th>Categoria</th>
              <th>Situação</th>
              <th className="rel-num">Valor</th>
            </tr>
          </thead>
          <tbody>
            {incluidos.map((l) => (
              <tr key={l.id}>
                <td>{formatarData(l.pagoEm ?? l.vencimento)}</td>
                <td>{l.descricao ?? l.clienteNome ?? '—'}</td>
                <td>{l.categoria}</td>
                <td>{l.pagoEm ? 'Pago' : 'Em aberto'}</td>
                <td className="rel-num">
                  {l.tipo === 'entrada' ? '' : '− '}
                  {formatarReais(l.valorCentavos)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={4}>Total de entradas</td>
              <td className="rel-num">{formatarReais(totais.entradas)}</td>
            </tr>
            <tr>
              <td colSpan={4}>Total de saídas</td>
              <td className="rel-num">{formatarReais(totais.saidas)}</td>
            </tr>
            <tr>
              <td colSpan={4}>
                <strong>Saldo</strong>
              </td>
              <td className="rel-num">
                <strong>{formatarReais(totais.saldo)}</strong>
              </td>
            </tr>
          </tfoot>
        </table>
        <p className="rel-imp-rodape">
          Extrato gerado pelo painel da funerária. Documento de conferência
          interna — não substitui documento fiscal.
          {fora.size > 0 &&
            ` ${fora.size} lançamento(s) do mês não incluído(s).`}
        </p>
      </div>
    </section>
  )
}
