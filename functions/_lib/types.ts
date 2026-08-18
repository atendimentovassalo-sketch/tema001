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
  /* Compartilhado com o Worker `proxy-obituario`: autoriza o `X-Real-IP` que ele
   * repassa. Ausente = rate-limit volta a ser por tenant (ver ipHash). */
  PROXY_SEGREDO?: string
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
  /* Dia em que começa o mês financeiro da funerária (1..28). Ver migration 0009.
   * Fica só aqui, e não no DTO público: é configuração interna. */
  diaInicioCiclo: number
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
  /** Desenho da vela escolhido. NULL = padrão (ver migration 0012). */
  velaTipo: string | null
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
