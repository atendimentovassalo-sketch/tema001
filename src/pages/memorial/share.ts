/* Texto de compartilhamento no WhatsApp: modelo do tenant (ou override da nota),
 * com variáveis substituídas. Usado no memorial e no obituário. */
import { dataHoraBR } from './format'
import type { Funeraria, Memorial } from './types'

/** Modelo usado quando a funerária ainda não definiu o dela. */
export const TEMPLATE_WHATSAPP_PADRAO =
  '{nome}\n{funeraria} — {cidade}/{uf}\nVelório: {horario} · {velorio}\n{link}'

/** Variáveis disponíveis no modelo (para a tela de Configurações). */
export const VARIAVEIS_WHATSAPP = [
  '{nome}',
  '{apelido}',
  '{velorio}',
  '{horario}',
  '{cidade}',
  '{uf}',
  '{funeraria}',
  '{link}',
]

export function linkMemorial(m: Memorial): string {
  const base = typeof window !== 'undefined' ? window.location.origin : ''
  return `${base}/m/${m.slug}`
}

/** Monta o texto final do WhatsApp para uma nota. */
export function montarTextoWhatsapp(m: Memorial, f: Funeraria): string {
  const modelo =
    (m.whatsappTexto && m.whatsappTexto.trim()) ||
    (f.whatsappTemplate && f.whatsappTemplate.trim()) ||
    TEMPLATE_WHATSAPP_PADRAO

  const velorio = m.eventos.find((e) => e.tipo === 'velorio')
  const horario =
    velorio && velorio.horarioConfirmado && velorio.inicioISO
      ? dataHoraBR(velorio.inicioISO)
      : 'horário a confirmar'

  const vars: Record<string, string> = {
    nome: m.nomeCompleto,
    apelido: m.apelido ?? m.nomeCompleto,
    velorio: velorio?.localNome ?? '',
    horario,
    cidade: f.cidade,
    uf: f.uf,
    funeraria: f.nome,
    link: linkMemorial(m),
  }

  return Object.entries(vars)
    .reduce((s, [k, v]) => s.split(`{${k}}`).join(v), modelo)
    .trim()
}

/** URL wa.me com o texto pronto. */
export function urlWhatsapp(m: Memorial, f: Funeraria): string {
  return `https://wa.me/?text=${encodeURIComponent(montarTextoWhatsapp(m, f))}`
}
