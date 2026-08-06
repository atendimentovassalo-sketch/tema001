/* Tipos compartilhados do backend (Pages Functions).
 * O formato de saída da API espelha src/pages/memorial/types.ts para que
 * ligar o front (Fase 5) seja um encaixe direto. */

export interface Env {
  DB: D1Database
  PHOTOS: R2Bucket
  // segredos/vars (Fase 3+)
  SESSION_TTL_HOURS?: string
  // e-mail transacional (recuperação de senha) — Resend
  RESEND_API_KEY?: string
  EMAIL_FROM?: string

  /* ----- Guarda-chuva: NOME E DOMÍNIO NÃO ESTÃO DEFINIDOS -----
   *
   * `obituario.com.br` é de terceiro (registrado há 10 anos, vence em 23/10/2026)
   * e provavelmente NÃO será nosso: após o vencimento fica congelado ~104 dias
   * com o dono podendo renovar, e a liberação do registro.br é por candidatura
   * com leilão quando há 2+ interessados — o que é quase certo num domínio de
   * palavra-chave. Cenário otimista: fev/2027, disputado. Plano B é marca
   * própria (o domínio não precisa conter "obituário" — ranqueia por conteúdo,
   * como o Legacy.com).
   *
   * REGRA: nenhum domínio ou nome de marca pode ser escrito no código. Tudo vem
   * daqui. Quando o domínio for definido, muda-se em UM lugar.
   *
   * Onde cada um vale:
   *  - front  -> `window.location.origin` (o domínio é onde a página já está)
   *  - rotas com request -> host da requisição (canonical, og:url)
   *  - sem request (sitemap, e-mail, cron) -> UMBRELLA_DOMAIN
   *  - texto de marca na tela (header do índice, rodapé) -> UMBRELLA_NOME
   */
  /** Domínio do guarda-chuva, sem esquema. Ex.: "exemplo.com.br". */
  UMBRELLA_DOMAIN?: string
  /** Nome de exibição da marca do guarda-chuva. Ex.: "Obituário Brasil". */
  UMBRELLA_NOME?: string
}

/* ----- Linhas do banco (snake_case) ----- */

export interface TenantRow {
  id: string
  slug: string
  nome: string
  cidade: string
  uf: string
  telefone: string
  whatsapp: string
  endereco: string | null
  desde: string | null
  sobre: string | null
  cor_marca: string
  velorio_local_padrao: string | null
  velorio_endereco_padrao: string | null
  sepultamento_local_padrao: string | null
  whatsapp_template: string | null
  /* U0 — guarda-chuva (ver Env) */
  cidade_id: string | null
  logo_url: string | null
  site_url: string | null
}

export interface CidadeRow {
  id: string
  slug: string
  nome: string
  uf: string
}

export interface UsuarioRow {
  id: string
  tenant_id: string
  nome: string
  email: string
  senha_hash: string | null
  senha_salt: string | null
  papel: string
  ativo: number
  convite_token: string | null
  convite_expira: string | null
}

export interface MemorialRow {
  id: string
  tenant_id: string
  slug: string
  nome_completo: string
  apelido: string | null
  foto_url: string | null
  nascimento_iso: string | null
  cidade_nascimento: string | null
  falecimento_iso: string
  cidade_falecimento: string | null
  idade: number | null
  epitafio: string | null
  historia: string | null
  visitas: number
  autorizado_por: string | null
  moderar_mensagens: number
  status: string
  whatsapp_texto: string | null
  /* U0 — cidade canônica do índice (cidade da funerária que publicou) */
  cidade_id: string | null
}

export interface EventoRow {
  id: string
  memorial_id: string
  tipo: string
  local_nome: string
  endereco: string | null
  inicio_iso: string | null
  horario_confirmado: number
  ordem: number
}

export interface FotoRow {
  id: string
  memorial_id: string
  url: string
  alt: string | null
  ordem: number
}

export interface HomenagemRow {
  id: string
  memorial_id: string
  tenant_id: string
  nome: string
  texto: string | null
  vela: number
  status: string
  criado_em: string
}

/* ----- Formato da API (camelCase, igual ao front) ----- */

export interface FunerariaDTO {
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
  /** Modelo de mensagem do WhatsApp (com variáveis). Null = usa o padrão do app. */
  whatsappTemplate: string | null
  /** Logo da funerária. Null = fallback tipográfico (monograma na cor da marca). */
  logoUrl: string | null
  /** Site próprio da funerária — destino do card no índice da cidade (o lead). */
  siteUrl: string | null
}

/* ----- Guarda-chuva (marca e domínio a definir — ver Env) ----- */

export interface CidadeDTO {
  slug: string
  nome: string
  uf: string
}

/** Cidade no índice nacional, com quantas notas publicadas tem. */
export interface CidadeComContagemDTO extends CidadeDTO {
  notas: number
}

/**
 * Item do índice da cidade. Deliberadamente enxuto: o índice não carrega
 * homenagens, fotos nem história — só o que a linha mostra. Uma cidade grande
 * tem centenas de notas e puxar tudo seria caro sem servir para nada.
 */
export interface NotaIndiceDTO {
  slug: string
  nomeCompleto: string
  fotoUrl: string | null
  nascimentoISO: string | null
  falecimentoISO: string
  idade: number | null
  /** Início do velório, só quando o horário está confirmado. Alimenta o selo "Velório hoje". */
  velorioInicioISO: string | null
  /** A funerária que informou a nota — é o card ao lado do nome. */
  funeraria: FunerariaDTO
}

export interface IndiceCidadeDTO {
  cidade: CidadeDTO
  total: number
  notas: NotaIndiceDTO[]
}

/** Configuração editável da funerária (área admin). */
export interface ConfigDTO {
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
}

export interface EventoDTO {
  id: string
  tipo: 'velorio' | 'cerimonia' | 'sepultamento'
  localNome: string
  endereco: string | null
  inicioISO: string | null
  horarioConfirmado: boolean
}

export interface FotoDTO {
  id: string
  url: string
  alt?: string
}

export interface HomenagemDTO {
  id: string
  nome: string
  texto: string | null
  vela: boolean
  criadoEmISO: string
  status: 'pendente' | 'aprovada' | 'recusada'
}

export interface MemorialDTO {
  id: string
  slug: string
  funeraria: FunerariaDTO
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
  eventos: EventoDTO[]
  fotos: FotoDTO[]
  homenagens: HomenagemDTO[]
  visitas: number
  autorizadoPor: string | null
  moderarMensagens: boolean
  /** Override da mensagem do WhatsApp para esta nota (null = usa o modelo). */
  whatsappTexto: string | null
}
