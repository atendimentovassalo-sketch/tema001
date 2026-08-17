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
  return d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' })
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

/** Desloca uma competência em N meses: ('2026-01', -1) -> '2025-12'. */
export function deslocarCompetencia(competencia: string, meses: number): string {
  const [ano, mes] = competencia.split('-').map(Number)
  const d = new Date(Date.UTC(ano, mes - 1 + meses, 1))
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
}
