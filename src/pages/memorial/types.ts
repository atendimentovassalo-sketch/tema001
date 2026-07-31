/* Tipos do memorial — espelham o modelo de dados do produto (funerária multi-inquilino). */

export interface Funeraria {
  id: string
  nome: string
  cidade: string
  uf: string
  telefone: string
  whatsapp: string
  endereco: string | null
  desde: string | null
  sobre: string | null
  corMarca: string
}

export type TipoEvento = 'velorio' | 'cerimonia' | 'sepultamento'

export interface Evento {
  id: string
  tipo: TipoEvento
  localNome: string
  endereco: string | null
  inicioISO: string | null
  horarioConfirmado: boolean
}

export interface Foto {
  id: string
  url: string
  alt?: string
}

/** Mensagem passa por conferência da família (aprovada) antes de aparecer. */
export interface Mensagem {
  id: string
  nome: string
  texto: string
  criadoEmISO: string
  status: 'pendente' | 'aprovada' | 'recusada'
}

/** Vela é gratuita e imediata — sem aprovação. */
export interface Vela {
  id: string
  nome: string
  texto: string | null
  criadoEmISO: string
}

export interface Memorial {
  id: string
  slug: string
  funeraria: Funeraria
  nomeCompleto: string
  apelido: string | null
  fotoUrl: string | null
  nascimentoISO: string | null
  cidadeNascimento: string | null
  falecimentoISO: string
  cidadeFalecimento: string | null
  idade: number | null
  /** Frase curta no herói e no card de compartilhamento. Opcional. */
  epitafio: string | null
  /** Biografia longa. Só existe quando a família envia e a funerária insere. */
  historia: string | null
  eventos: Evento[]
  fotos: Foto[]
  mensagens: Mensagem[]
  velas: Vela[]
  visitas: number
  /** Nome de quem autorizou a publicação — exibido no rodapé. */
  autorizadoPor: string | null
  /**
   * Se true, mensagens ficam 'pendente' até a família aprovar (via WhatsApp do
   * responsável). Se false (padrão), mensagens entram na hora. Opcional porque
   * a maioria das famílias não terá desafetos.
   */
  moderarMensagens: boolean
}
