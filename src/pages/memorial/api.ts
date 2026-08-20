/* Chamadas à API do memorial usadas pelas páginas públicas e pelo admin.
 * Os DTOs do backend espelham os tipos abaixo (Funeraria/Memorial). */
import { api } from '@/lib/api'
import type { Funeraria, Memorial, Homenagem } from './types'

interface ListaResp {
  funeraria: Funeraria
  memoriais: Memorial[]
}

/** Home/obituário: funerária + publicados. */
export function fetchPublicados(opts?: {
  limite?: number
  excluir?: string
}): Promise<ListaResp> {
  const q = new URLSearchParams()
  if (opts?.limite) q.set('limite', String(opts.limite))
  if (opts?.excluir) q.set('excluir', opts.excluir)
  const qs = q.toString()
  return api.get<ListaResp>(`/api/memoriais${qs ? `?${qs}` : ''}`)
}

/** Página de memorial por slug. */
export async function fetchMemorial(slug: string): Promise<Memorial | null> {
  try {
    const r = await api.get<{ memorial: Memorial }>(
      `/api/memoriais/${encodeURIComponent(slug)}`,
    )
    return r.memorial
  } catch {
    return null
  }
}

export interface EnvioHomenagem {
  memorialSlug: string
  nome: string
  texto?: string
  vela: boolean
  /** Desenho escolhido. Sem isto a escolha ficava só na tela e nunca chegava
   *  ao servidor — bug achado em 18/08, no mesmo dia em que a escolha entrou. */
  velaTipo?: string | null
  website?: string
}

export function enviarHomenagem(
  dados: EnvioHomenagem,
): Promise<{ ok: true; homenagem: Homenagem; moderada: boolean }> {
  return api.post('/api/homenagens', dados)
}

export interface AprovacaoInfo {
  homenagem: Homenagem
  memorial: { nomeCompleto: string; slug: string } | null
  /** A casca de site é dirigida pelo inquilino; null quando o host não
   *  corresponde a nenhuma funerária (aí a casca fica sem marca). */
  funeraria: Funeraria | null
}

export function fetchAprovacao(token: string): Promise<AprovacaoInfo> {
  return api.get<AprovacaoInfo>(`/api/aprovar/${encodeURIComponent(token)}`)
}

export function decidirAprovacao(
  token: string,
  acao: 'aprovar' | 'recusar',
): Promise<{ ok: true; status: string }> {
  return api.post(`/api/aprovar/${encodeURIComponent(token)}`, { acao })
}

/* ----- admin (requer sessão) ----- */

export interface DadosMemorialInput {
  nomeCompleto: string
  apelido: string | null
  fotoUrl: string | null
  nascimentoISO: string | null
  cidadeNascimento: string | null
  falecimentoISO: string
  cidadeFalecimento: string | null
  idade: number | null
  epitafio: string | null
  historia: string | null
  autorizadoPor: string | null
  moderarMensagens: boolean
  whatsappTexto: string | null
  eventos: {
    tipo: 'velorio' | 'cerimonia' | 'sepultamento'
    localNome: string
    endereco: string | null
    inicioISO: string | null
    horarioConfirmado: boolean
  }[]
  fotos: { url: string; alt: string | null }[]
}

export interface ConfigTenant {
  nome: string
  cidade: string
  uf: string
  telefone: string
  whatsapp: string
  endereco: string | null
  desde: string | null
  sobre: string | null
  velorioLocalPadrao: string | null
  velorioEnderecoPadrao: string | null
  sepultamentoLocalPadrao: string | null
  whatsappTemplate: string | null
  /* Dia em que começa o mês financeiro da funerária (1..28). Ver migration 0009. */
  diaInicioCiclo: number
}

export async function fetchConfig(): Promise<{
  config: ConfigTenant
  funeraria: Funeraria
}> {
  return api.get<{ config: ConfigTenant; funeraria: Funeraria }>(
    '/api/admin/config',
  )
}

export function salvarConfig(c: ConfigTenant): Promise<{ ok: true }> {
  return api.put('/api/admin/config', c)
}

export async function fetchMemorialAdmin(id: string): Promise<Memorial | null> {
  try {
    const r = await api.get<{ memorial: Memorial }>(`/api/admin/memoriais/${id}`)
    return r.memorial
  } catch {
    return null
  }
}

export function criarMemorial(
  dados: DadosMemorialInput,
): Promise<{ ok: true; id: string; slug: string }> {
  return api.post('/api/admin/memoriais', dados)
}

export function atualizarMemorialApi(
  id: string,
  dados: DadosMemorialInput,
): Promise<{ ok: true; slug: string }> {
  return api.put(`/api/admin/memoriais/${id}`, dados)
}

export function publicarMemorialApi(
  id: string,
  publicar: boolean,
): Promise<{ ok: true; status: string }> {
  return api.post(`/api/admin/memoriais/${id}/publicar`, { publicar })
}

/** Sobe uma foto (Blob) para o R2 e devolve o caminho servível. */
export async function uploadFoto(blob: Blob): Promise<string> {
  const r = await api.upload('/api/admin/fotos', blob)
  return r.url
}
