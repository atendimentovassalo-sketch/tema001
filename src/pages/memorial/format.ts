/* Helpers de formatação em pt-BR (America/Sao_Paulo). */

const MESES = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
]

/** "28 de julho, às 19h" */
export function dataHoraBR(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  const p = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: 'numeric',
    month: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(d)
  const g = (t: string) => p.find((x) => x.type === t)?.value ?? ''
  const dia = g('day')
  const mes = MESES[Number(g('month')) - 1]
  const hh = g('hour')
  const mm = g('minute')
  const hora = mm === '00' ? `${Number(hh)}h` : `${Number(hh)}h${mm}`
  return `${dia} de ${mes}, às ${hora}`
}

/** "22 de abril de 2001" */
export function dataLongaBR(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  const p = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  }).formatToParts(d)
  const g = (t: string) => p.find((x) => x.type === t)?.value ?? ''
  return `${g('day')} de ${MESES[Number(g('month')) - 1]} de ${g('year')}`
}

export function idadeEm(
  nascimento: string | null,
  falecimento: string | null,
): number | null {
  if (!nascimento || !falecimento) return null
  const n = new Date(nascimento)
  const f = new Date(falecimento)
  if (isNaN(n.getTime()) || isNaN(f.getTime())) return null
  let a = f.getFullYear() - n.getFullYear()
  const m = f.getMonth() - n.getMonth()
  if (m < 0 || (m === 0 && f.getDate() < n.getDate())) a -= 1
  return a >= 0 && a < 130 ? a : null
}

/** "28/07" a partir de um ISO (YYYY-MM-DD...). */
export function ddmm(iso: string): string {
  const s = String(iso)
  return `${s.slice(8, 10)}/${s.slice(5, 7)}`
}

export function anoBR(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  return isNaN(d.getTime()) ? '' : String(d.getUTCFullYear())
}

export function iniciais(nome: string): string {
  return nome
    .split(/\s+/)
    .filter((p) => p.length > 2)
    .slice(0, 3)
    .map((p) => p[0]!.toUpperCase())
    .join('')
}

/** "há 2 horas", "há 3 dias", "agora" — relativo a agora. */
export function tempoRelativo(iso: string): string {
  const then = new Date(iso).getTime()
  if (isNaN(then)) return ''
  const diff = Math.max(0, Date.now() - then)
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'agora mesmo'
  if (min < 60) return `há ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `há ${h} ${h === 1 ? 'hora' : 'horas'}`
  const d = Math.floor(h / 24)
  return `há ${d} ${d === 1 ? 'dia' : 'dias'}`
}
