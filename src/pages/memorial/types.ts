/* Tipos do memorial — espelham o modelo de dados do produto (funerária multi-inquilino). */

/** Um item do menu do site institucional da funerária: ou leva a um endereço
 *  (`href`), ou abre um submenu (`itens`). */
export interface ItemMenu {
  rotulo: string
  href?: string
  itens?: { rotulo: string; href: string }[]
}

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
  whatsappTemplate: string | null
  /** Contato público do rodapé. Null = a linha some. */
  email: string | null
  /** Menu do site institucional. Null = a funerária não tem site próprio, e o
   *  cabeçalho fica só com o obituário. Ver migration 0015. */
  siteMenu: ItemMenu[] | null
  /** Horário de atendimento (texto livre, com quebras de linha). */
  siteHorario: string | null
  /** CNPJ / alvará / razão social (texto livre, com quebras de linha).
   *  @deprecated desde a migration 0016 — o bloco "Empresa" do rodapé vem de
   *  `razaoSocial` / `cnpj` / `alvara`. */
  siteLegal: string | null
  /** Razão social do controlador dos dados, nomeada em /privacidade e /termos. */
  razaoSocial: string | null
  cnpj: string | null
  /** Alvará de funcionamento — aparece no rodapé, não nos documentos. */
  alvara: string | null
  /** Contato do Encarregado (LGPD). Null = os documentos remetem ao e-mail
   *  público, e na falta dele ao WhatsApp da funerária. */
  dpoEmail: string | null
  /** Comarca do foro eleito nos Termos. Null = a cláusula sai do documento. */
  foroComarca: string | null
  /** Logo da funerária. Null = o painel mostra o nome em tipo. */
  logoUrl: string | null
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

/**
 * Uma homenagem: pode trazer mensagem, uma vela acesa, ou ambas.
 * - `vela`: a pessoa acendeu uma vela (gratuita, imediata).
 * - `texto`: a mensagem escrita (opcional). Passa por conferência quando a
 *   família modera; `status` se aplica ao texto — a vela nunca depende dele.
 */
export interface Homenagem {
  id: string
  nome: string
  texto: string | null
  vela: boolean
  criadoEmISO: string
  status: 'pendente' | 'aprovada' | 'recusada'
  /** Desenho escolhido por quem acendeu. null = padrão (homenagens antigas
   *  e as que vieram antes da escolha existir). */
  velaTipo: string | null
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
  homenagens: Homenagem[]
  visitas: number
  /** Override do texto de compartilhamento no WhatsApp (null = usa o modelo). */
  whatsappTexto: string | null
  /** Nome de quem autorizou a publicação — exibido no rodapé. */
  autorizadoPor: string | null
  /**
   * Se true, mensagens ficam 'pendente' até a família aprovar (via WhatsApp do
   * responsável). Se false (padrão), mensagens entram na hora. Opcional porque
   * a maioria das famílias não terá desafetos.
   */
  moderarMensagens: boolean
}
