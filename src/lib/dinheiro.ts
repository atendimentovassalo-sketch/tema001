/* Dinheiro no front. O banco guarda centavos inteiros (ver migration 0008); a
 * tela é o único lugar onde vira "R$ 97,00". Nada aqui usa float para contas —
 * só para exibir. */

/** 9700 -> "R$ 97,00" */
export function formatarReais(centavos: number): string {
  return (centavos / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

/** O que a pessoa digita -> centavos. Aceita "97", "97,50", "1.234,56", "R$ 97".
 *  Devolve null se não der para entender — o chamador decide o que fazer, em vez
 *  de receber um NaN silencioso que vira lançamento zerado no banco. */
export function paraCentavos(texto: string): number | null {
  const limpo = texto.replace(/[^\d,.-]/g, '').trim()
  if (!limpo) return null
  // Formato brasileiro: ponto é milhar, vírgula é decimal.
  const normalizado = limpo.replace(/\./g, '').replace(',', '.')
  const n = Number(normalizado)
  if (!Number.isFinite(n) || n < 0) return null
  return Math.round(n * 100)
}

/** 'AAAA-MM' -> "agosto de 2026" */
export function nomeCompetencia(competencia: string): string {
  const [ano, mes] = competencia.split('-').map(Number)
  if (!ano || !mes) return competencia
  const d = new Date(Date.UTC(ano, mes - 1, 1))
  return d.toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

/** 'AAAA-MM-DD' -> "05/08/2026". Meio-dia UTC de propósito: com T00:00 a data
 *  volta um dia em qualquer fuso a oeste de Greenwich, e o Brasil inteiro é. */
export function formatarData(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso + 'T12:00:00Z')
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('pt-BR', { timeZone: 'UTC' })
}

/** Hoje em 'AAAA-MM-DD', no fuso de Brasília (o Worker roda em UTC). */
export function hojeISO(): string {
  const brt = new Date(Date.now() - 3 * 3600 * 1000)
  return brt.toISOString().slice(0, 10)
}

/** Mês corrente em 'AAAA-MM', mesmo cuidado de fuso. */
export function competenciaAtual(): string {
  return hojeISO().slice(0, 7)
}

/** Competência de hoje respeitando o dia de início do ciclo da funerária.
 *
 *  Com `diaInicio = 10`, o dia 5 de setembro ainda pertence a agosto: quem
 *  recebe as mensalidades no dia 10 pensa o mês de 10 a 9, e o painel tem de
 *  abrir no mês que a pessoa tem na cabeça, não no do calendário.
 *
 *  `diaInicio = 1` devolve exatamente o mês do calendário — que é o padrão e o
 *  comportamento de antes desta opção existir. */
export function competenciaDoCiclo(diaInicio: number): string {
  const hoje = hojeISO()
  const dia = Number(hoje.slice(8, 10))
  const mes = hoje.slice(0, 7)
  return dia >= diaInicio ? mes : deslocarCompetencia(mes, -1)
}

/** Rótulo do intervalo coberto por uma competência, quando o ciclo não começa
 *  no dia 1. Serve para a tela dizer o que "agosto" significa nesta funerária. */
export function intervaloDoCiclo(
  competencia: string,
  diaInicio: number,
): string | null {
  if (diaInicio <= 1) return null
  const fim = deslocarCompetencia(competencia, 1)
  const d = String(diaInicio).padStart(2, '0')
  const anterior = new Date(
    Date.UTC(
      Number(fim.slice(0, 4)),
      Number(fim.slice(5, 7)) - 1,
      diaInicio - 1,
    ),
  )
  return `${d}/${competencia.slice(5, 7)} a ${String(anterior.getUTCDate()).padStart(2, '0')}/${fim.slice(5, 7)}`
}

/** Desloca uma competência em N meses: ('2026-01', -1) -> '2025-12'. */
export function deslocarCompetencia(
  competencia: string,
  meses: number,
): string {
  const [ano, mes] = competencia.split('-').map(Number)
  const d = new Date(Date.UTC(ano, mes - 1 + meses, 1))
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
}
