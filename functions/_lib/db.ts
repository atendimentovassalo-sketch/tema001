/* Repositório D1 + mapeadores linha->DTO. Único ponto que fala com o banco. */
import type {
  Env,
  TenantRow,
  MemorialRow,
  EventoRow,
  FotoRow,
  HomenagemRow,
  FunerariaDTO,
  EventoDTO,
  FotoDTO,
  HomenagemDTO,
  MemorialDTO,
} from './types'

/* ---------- mapeadores ---------- */

export function toFunerariaDTO(t: TenantRow): FunerariaDTO {
  return {
    id: t.id,
    nome: t.nome,
    cidade: t.cidade,
    uf: t.uf,
    telefone: t.telefone,
    whatsapp: t.whatsapp,
    endereco: t.endereco,
    desde: t.desde,
    sobre: t.sobre,
    corMarca: t.cor_marca,
  }
}

function toEventoDTO(e: EventoRow): EventoDTO {
  return {
    id: e.id,
    tipo: e.tipo as EventoDTO['tipo'],
    localNome: e.local_nome,
    endereco: e.endereco,
    inicioISO: e.inicio_iso,
    horarioConfirmado: !!e.horario_confirmado,
  }
}

function toFotoDTO(f: FotoRow): FotoDTO {
  return f.alt ? { id: f.id, url: f.url, alt: f.alt } : { id: f.id, url: f.url }
}

function toHomenagemDTO(h: HomenagemRow): HomenagemDTO {
  return {
    id: h.id,
    nome: h.nome,
    texto: h.texto,
    vela: !!h.vela,
    criadoEmISO: h.criado_em,
    status: h.status as HomenagemDTO['status'],
  }
}

function toMemorialDTO(
  m: MemorialRow,
  funeraria: FunerariaDTO,
  eventos: EventoDTO[],
  fotos: FotoDTO[],
  homenagens: HomenagemDTO[],
): MemorialDTO {
  return {
    id: m.id,
    slug: m.slug,
    funeraria,
    nomeCompleto: m.nome_completo,
    apelido: m.apelido,
    fotoUrl: m.foto_url,
    nascimentoISO: m.nascimento_iso,
    cidadeNascimento: m.cidade_nascimento,
    falecimentoISO: m.falecimento_iso,
    cidadeFalecimento: m.cidade_falecimento,
    idade: m.idade,
    epitafio: m.epitafio,
    historia: m.historia,
    eventos,
    fotos,
    homenagens,
    visitas: m.visitas,
    autorizadoPor: m.autorizado_por,
    moderarMensagens: !!m.moderar_mensagens,
  }
}

/* ---------- tenant ---------- */

/** Lançamento single-tenant: resolve o único tenant (ou por slug, no futuro). */
export async function getTenant(
  env: Env,
  slug?: string,
): Promise<TenantRow | null> {
  const sql = slug
    ? 'SELECT * FROM tenant WHERE slug = ? LIMIT 1'
    : 'SELECT * FROM tenant ORDER BY criado_em ASC LIMIT 1'
  const stmt = slug ? env.DB.prepare(sql).bind(slug) : env.DB.prepare(sql)
  return (await stmt.first<TenantRow>()) ?? null
}

/* ---------- helpers ---------- */

function placeholders(n: number): string {
  return Array.from({ length: n }, () => '?').join(', ')
}

/** Feed público: velas sempre; mensagens só aprovadas. */
function homenagemVisivelPublica(h: HomenagemRow): boolean {
  return !!h.vela || h.status === 'aprovada'
}

async function carregarRelacionados(
  env: Env,
  memorialIds: string[],
): Promise<{
  eventos: Map<string, EventoDTO[]>
  fotos: Map<string, FotoDTO[]>
  homenagens: Map<string, HomenagemRow[]>
}> {
  const eventos = new Map<string, EventoDTO[]>()
  const fotos = new Map<string, FotoDTO[]>()
  const homenagens = new Map<string, HomenagemRow[]>()
  if (memorialIds.length === 0) return { eventos, fotos, homenagens }

  const ph = placeholders(memorialIds.length)
  const [ev, ft, hm] = await env.DB.batch<EventoRow | FotoRow | HomenagemRow>([
    env.DB.prepare(
      `SELECT * FROM evento WHERE memorial_id IN (${ph}) ORDER BY ordem ASC`,
    ).bind(...memorialIds),
    env.DB.prepare(
      `SELECT * FROM foto WHERE memorial_id IN (${ph}) ORDER BY ordem ASC`,
    ).bind(...memorialIds),
    env.DB.prepare(
      `SELECT * FROM homenagem WHERE memorial_id IN (${ph}) ORDER BY criado_em DESC`,
    ).bind(...memorialIds),
  ])

  for (const row of ev.results as EventoRow[]) {
    const list = eventos.get(row.memorial_id) ?? []
    list.push(toEventoDTO(row))
    eventos.set(row.memorial_id, list)
  }
  for (const row of ft.results as FotoRow[]) {
    const list = fotos.get(row.memorial_id) ?? []
    list.push(toFotoDTO(row))
    fotos.set(row.memorial_id, list)
  }
  for (const row of hm.results as HomenagemRow[]) {
    const list = homenagens.get(row.memorial_id) ?? []
    list.push(row)
    homenagens.set(row.memorial_id, list)
  }
  return { eventos, fotos, homenagens }
}

/* ---------- consultas públicas ---------- */

/** Publicados do tenant, mais recentes primeiro. */
export async function listPublicados(
  env: Env,
  tenant: TenantRow,
  opts: { limite?: number; excluir?: string } = {},
): Promise<MemorialDTO[]> {
  const { limite = 60, excluir } = opts
  const funeraria = toFunerariaDTO(tenant)

  const rows = excluir
    ? await env.DB.prepare(
        `SELECT * FROM memorial WHERE tenant_id = ? AND status = 'publicado' AND slug != ?
         ORDER BY falecimento_iso DESC LIMIT ?`,
      )
        .bind(tenant.id, excluir, limite)
        .all<MemorialRow>()
    : await env.DB.prepare(
        `SELECT * FROM memorial WHERE tenant_id = ? AND status = 'publicado'
         ORDER BY falecimento_iso DESC LIMIT ?`,
      )
        .bind(tenant.id, limite)
        .all<MemorialRow>()

  const memoriais = rows.results
  const rel = await carregarRelacionados(
    env,
    memoriais.map((m) => m.id),
  )
  return memoriais.map((m) =>
    toMemorialDTO(
      m,
      funeraria,
      rel.eventos.get(m.id) ?? [],
      rel.fotos.get(m.id) ?? [],
      (rel.homenagens.get(m.id) ?? [])
        .filter(homenagemVisivelPublica)
        .map(toHomenagemDTO),
    ),
  )
}

/** Um memorial publicado por slug, com tudo (feed público). */
export async function getMemorialPublico(
  env: Env,
  tenant: TenantRow,
  slug: string,
): Promise<MemorialDTO | null> {
  const m = await env.DB.prepare(
    `SELECT * FROM memorial WHERE tenant_id = ? AND slug = ? LIMIT 1`,
  )
    .bind(tenant.id, slug)
    .first<MemorialRow>()
  if (!m) return null
  const rel = await carregarRelacionados(env, [m.id])
  return toMemorialDTO(
    m,
    toFunerariaDTO(tenant),
    rel.eventos.get(m.id) ?? [],
    rel.fotos.get(m.id) ?? [],
    (rel.homenagens.get(m.id) ?? [])
      .filter(homenagemVisivelPublica)
      .map(toHomenagemDTO),
  )
}

/** +1 visita (best-effort). */
export async function incrementarVisitas(
  env: Env,
  memorialId: string,
): Promise<void> {
  await env.DB.prepare(
    `UPDATE memorial SET visitas = visitas + 1 WHERE id = ?`,
  )
    .bind(memorialId)
    .run()
}

/* ---------- homenagens ---------- */

export interface NovaHomenagem {
  memorialId: string
  tenantId: string
  nome: string
  texto: string | null
  vela: boolean
  status: 'pendente' | 'aprovada'
  aprovarToken: string | null
  ipHash: string | null
}

export async function inserirHomenagem(
  env: Env,
  id: string,
  h: NovaHomenagem,
): Promise<void> {
  await env.DB.prepare(
    `INSERT INTO homenagem (id, memorial_id, tenant_id, nome, texto, vela, status, aprovar_token, ip_hash)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      id,
      h.memorialId,
      h.tenantId,
      h.nome,
      h.texto,
      h.vela ? 1 : 0,
      h.status,
      h.aprovarToken,
      h.ipHash,
    )
    .run()
}

export async function getHomenagemPorToken(
  env: Env,
  token: string,
): Promise<HomenagemRow | null> {
  return (
    (await env.DB.prepare(
      `SELECT * FROM homenagem WHERE aprovar_token = ? LIMIT 1`,
    )
      .bind(token)
      .first<HomenagemRow>()) ?? null
  )
}

export async function definirStatusHomenagem(
  env: Env,
  id: string,
  status: 'aprovada' | 'recusada',
): Promise<void> {
  await env.DB.prepare(`UPDATE homenagem SET status = ? WHERE id = ?`)
    .bind(status, id)
    .run()
}
