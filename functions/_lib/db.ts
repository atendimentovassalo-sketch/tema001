/* Repositório D1 + mapeadores linha->DTO. Único ponto que fala com o banco. */
import type {
  Env,
  TenantRow,
  UsuarioRow,
  MemorialRow,
  EventoRow,
  FotoRow,
  HomenagemRow,
  FunerariaDTO,
  ConfigDTO,
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
    whatsappTemplate: t.whatsapp_template,
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
    whatsappTexto: m.whatsapp_texto,
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

export async function getTenantPorId(
  env: Env,
  id: string,
): Promise<TenantRow | null> {
  return (
    (await env.DB.prepare('SELECT * FROM tenant WHERE id = ? LIMIT 1')
      .bind(id)
      .first<TenantRow>()) ?? null
  )
}

export function toConfigDTO(t: TenantRow): ConfigDTO {
  return {
    nome: t.nome,
    cidade: t.cidade,
    uf: t.uf,
    telefone: t.telefone,
    whatsapp: t.whatsapp,
    endereco: t.endereco,
    desde: t.desde,
    sobre: t.sobre,
    velorioLocalPadrao: t.velorio_local_padrao,
    velorioEnderecoPadrao: t.velorio_endereco_padrao,
    sepultamentoLocalPadrao: t.sepultamento_local_padrao,
    whatsappTemplate: t.whatsapp_template,
  }
}

export async function atualizarConfig(
  env: Env,
  tenantId: string,
  c: ConfigDTO,
): Promise<void> {
  await env.DB.prepare(
    `UPDATE tenant SET nome = ?, cidade = ?, uf = ?, telefone = ?, whatsapp = ?,
      endereco = ?, desde = ?, sobre = ?, velorio_local_padrao = ?,
      velorio_endereco_padrao = ?, sepultamento_local_padrao = ?,
      whatsapp_template = ? WHERE id = ?`,
  )
    .bind(
      c.nome,
      c.cidade,
      c.uf,
      c.telefone,
      c.whatsapp,
      c.endereco,
      c.desde,
      c.sobre,
      c.velorioLocalPadrao,
      c.velorioEnderecoPadrao,
      c.sepultamentoLocalPadrao,
      c.whatsappTemplate,
      tenantId,
    )
    .run()
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

/** Dados mínimos de um memorial publicado (para inserir homenagem). */
export async function getMemorialBasico(
  env: Env,
  tenantId: string,
  slug: string,
): Promise<{ id: string; moderar: boolean } | null> {
  const row = await env.DB.prepare(
    `SELECT id, moderar_mensagens FROM memorial
     WHERE tenant_id = ? AND slug = ? AND status = 'publicado' LIMIT 1`,
  )
    .bind(tenantId, slug)
    .first<{ id: string; moderar_mensagens: number }>()
  if (!row) return null
  return { id: row.id, moderar: !!row.moderar_mensagens }
}

/** Quantas homenagens este IP criou nos últimos N segundos (rate-limit). */
export async function contarHomenagensRecentesPorIp(
  env: Env,
  ipHashValor: string,
  segundos: number,
): Promise<number> {
  const row = await env.DB.prepare(
    `SELECT count(*) AS n FROM homenagem
     WHERE ip_hash = ? AND criado_em > datetime('now', ?)`,
  )
    .bind(ipHashValor, `-${segundos} seconds`)
    .first<{ n: number }>()
  return row?.n ?? 0
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
  // limpa o token para o link de aprovação não ser reutilizado
  await env.DB.prepare(
    `UPDATE homenagem SET status = ?, aprovar_token = NULL WHERE id = ?`,
  )
    .bind(status, id)
    .run()
}

export async function getMemorialNomeSlug(
  env: Env,
  memorialId: string,
): Promise<{ nome_completo: string; slug: string } | null> {
  return (
    (await env.DB.prepare(
      `SELECT nome_completo, slug FROM memorial WHERE id = ? LIMIT 1`,
    )
      .bind(memorialId)
      .first<{ nome_completo: string; slug: string }>()) ?? null
  )
}

/* ===================== AUTENTICAÇÃO ===================== */

export async function getUsuarioPorEmail(
  env: Env,
  email: string,
): Promise<UsuarioRow | null> {
  return (
    (await env.DB.prepare(
      `SELECT * FROM usuario WHERE email = ? AND ativo = 1 LIMIT 1`,
    )
      .bind(email.toLowerCase())
      .first<UsuarioRow>()) ?? null
  )
}

export async function getUsuarioPorConvite(
  env: Env,
  token: string,
): Promise<UsuarioRow | null> {
  return (
    (await env.DB.prepare(
      `SELECT * FROM usuario WHERE convite_token = ? AND ativo = 1 LIMIT 1`,
    )
      .bind(token)
      .first<UsuarioRow>()) ?? null
  )
}

export async function definirSenhaUsuario(
  env: Env,
  id: string,
  hash: string,
  salt: string,
): Promise<void> {
  await env.DB.prepare(
    `UPDATE usuario SET senha_hash = ?, senha_salt = ?, convite_token = NULL,
     convite_expira = NULL WHERE id = ?`,
  )
    .bind(hash, salt, id)
    .run()
}

/** Gera/atualiza o token de convite para recuperação de senha. */
export async function definirConviteRecuperacao(
  env: Env,
  id: string,
  token: string,
  expiraISO: string,
): Promise<void> {
  await env.DB.prepare(
    `UPDATE usuario SET convite_token = ?, convite_expira = ? WHERE id = ?`,
  )
    .bind(token, expiraISO, id)
    .run()
}

export async function registrarAcesso(env: Env, id: string): Promise<void> {
  await env.DB.prepare(
    `UPDATE usuario SET ultimo_acesso = datetime('now') WHERE id = ?`,
  )
    .bind(id)
    .run()
}

export async function inserirSessao(
  env: Env,
  token: string,
  usuarioId: string,
  tenantId: string,
  expiraISO: string,
): Promise<void> {
  await env.DB.prepare(
    `INSERT INTO sessao (id, usuario_id, tenant_id, expira_em) VALUES (?, ?, ?, ?)`,
  )
    .bind(token, usuarioId, tenantId, expiraISO)
    .run()
}

export interface SessaoUsuario {
  usuarioId: string
  tenantId: string
  nome: string
  email: string
  papel: string
}

/** Sessão válida (não expirada) + dados do usuário, ou null. */
export async function getSessaoComUsuario(
  env: Env,
  token: string,
): Promise<SessaoUsuario | null> {
  const row = await env.DB.prepare(
    `SELECT u.id AS usuarioId, u.tenant_id AS tenantId, u.nome, u.email, u.papel
     FROM sessao s JOIN usuario u ON u.id = s.usuario_id
     WHERE s.id = ? AND s.expira_em > datetime('now') AND u.ativo = 1 LIMIT 1`,
  )
    .bind(token)
    .first<SessaoUsuario>()
  return row ?? null
}

export async function deletarSessao(env: Env, token: string): Promise<void> {
  await env.DB.prepare(`DELETE FROM sessao WHERE id = ?`).bind(token).run()
}

/* ----- administração de usuários da funerária ----- */

export interface UsuarioAdminDTO {
  id: string
  nome: string
  email: string
  papel: string
  ativo: boolean
  temSenha: boolean
  conviteAtivo: boolean
  ultimoAcessoISO: string | null
  criadoEmISO: string
}

interface UsuarioAdminRow {
  id: string
  nome: string
  email: string
  papel: string
  ativo: number
  tem_senha: number
  convite_token: string | null
  convite_expira: string | null
  ultimo_acesso: string | null
  criado_em: string
}

function toUsuarioAdminDTO(r: UsuarioAdminRow): UsuarioAdminDTO {
  const conviteAtivo =
    !!r.convite_token &&
    (!r.convite_expira || new Date(r.convite_expira + 'Z').getTime() > Date.now())
  return {
    id: r.id,
    nome: r.nome,
    email: r.email,
    papel: r.papel,
    ativo: !!r.ativo,
    temSenha: !!r.tem_senha,
    conviteAtivo,
    ultimoAcessoISO: r.ultimo_acesso,
    criadoEmISO: r.criado_em,
  }
}

export async function listUsuarios(
  env: Env,
  tenantId: string,
): Promise<UsuarioAdminDTO[]> {
  const rows = await env.DB.prepare(
    `SELECT id, nome, email, papel, ativo, (senha_hash IS NOT NULL) AS tem_senha,
            convite_token, convite_expira, ultimo_acesso, criado_em
     FROM usuario WHERE tenant_id = ? ORDER BY criado_em ASC`,
  )
    .bind(tenantId)
    .all<UsuarioAdminRow>()
  return rows.results.map(toUsuarioAdminDTO)
}

export async function getUsuarioDoTenant(
  env: Env,
  tenantId: string,
  id: string,
): Promise<UsuarioRow | null> {
  return (
    (await env.DB.prepare(
      `SELECT * FROM usuario WHERE id = ? AND tenant_id = ? LIMIT 1`,
    )
      .bind(id, tenantId)
      .first<UsuarioRow>()) ?? null
  )
}

/** Checa e-mail em uso (inclusive inativos: a coluna é UNIQUE). */
export async function emailEmUso(env: Env, email: string): Promise<boolean> {
  const r = await env.DB.prepare(
    `SELECT 1 AS x FROM usuario WHERE email = ? LIMIT 1`,
  )
    .bind(email.toLowerCase())
    .first<{ x: number }>()
  return !!r
}

export async function criarUsuario(
  env: Env,
  dados: {
    id: string
    tenantId: string
    nome: string
    email: string
    papel: string
    conviteToken: string
    conviteExpiraISO: string
  },
): Promise<void> {
  await env.DB.prepare(
    `INSERT INTO usuario (id, tenant_id, nome, email, papel, ativo,
       convite_token, convite_expira)
     VALUES (?, ?, ?, ?, ?, 1, ?, ?)`,
  )
    .bind(
      dados.id,
      dados.tenantId,
      dados.nome,
      dados.email.toLowerCase(),
      dados.papel,
      dados.conviteToken,
      dados.conviteExpiraISO,
    )
    .run()
}

export async function atualizarUsuario(
  env: Env,
  id: string,
  dados: { nome: string; papel: string },
): Promise<void> {
  await env.DB.prepare(`UPDATE usuario SET nome = ?, papel = ? WHERE id = ?`)
    .bind(dados.nome, dados.papel, id)
    .run()
}

export async function setAtivoUsuario(
  env: Env,
  id: string,
  ativo: boolean,
): Promise<void> {
  await env.DB.prepare(`UPDATE usuario SET ativo = ? WHERE id = ?`)
    .bind(ativo ? 1 : 0, id)
    .run()
  if (!ativo) {
    // desativar derruba as sessões abertas dessa pessoa
    await env.DB.prepare(`DELETE FROM sessao WHERE usuario_id = ?`).bind(id).run()
  }
}

export async function deletarUsuario(env: Env, id: string): Promise<void> {
  await env.DB.prepare(`DELETE FROM sessao WHERE usuario_id = ?`).bind(id).run()
  await env.DB.prepare(`DELETE FROM usuario WHERE id = ?`).bind(id).run()
}

/* ===================== ADMIN: MEMORIAIS ===================== */

export interface MemorialAdminItem {
  id: string
  slug: string
  nomeCompleto: string
  fotoUrl: string | null
  falecimentoISO: string
  status: string
  visitas: number
  pendentes: number
}

export async function listMemoriaisAdmin(
  env: Env,
  tenantId: string,
): Promise<MemorialAdminItem[]> {
  const rows = await env.DB.prepare(
    `SELECT m.id, m.slug, m.nome_completo, m.foto_url, m.falecimento_iso,
            m.status, m.visitas,
            (SELECT count(*) FROM homenagem h
              WHERE h.memorial_id = m.id AND h.status = 'pendente') AS pendentes
     FROM memorial m WHERE m.tenant_id = ?
     ORDER BY m.criado_em DESC`,
  )
    .bind(tenantId)
    .all<{
      id: string
      slug: string
      nome_completo: string
      foto_url: string | null
      falecimento_iso: string
      status: string
      visitas: number
      pendentes: number
    }>()
  return rows.results.map((r) => ({
    id: r.id,
    slug: r.slug,
    nomeCompleto: r.nome_completo,
    fotoUrl: r.foto_url,
    falecimentoISO: r.falecimento_iso,
    status: r.status,
    visitas: r.visitas,
    pendentes: r.pendentes,
  }))
}

export async function getMemorialAdmin(
  env: Env,
  tenant: TenantRow,
  id: string,
): Promise<MemorialDTO | null> {
  const m = await env.DB.prepare(
    `SELECT * FROM memorial WHERE tenant_id = ? AND id = ? LIMIT 1`,
  )
    .bind(tenant.id, id)
    .first<MemorialRow>()
  if (!m) return null
  const rel = await carregarRelacionados(env, [m.id])
  return toMemorialDTO(
    m,
    toFunerariaDTO(tenant),
    rel.eventos.get(m.id) ?? [],
    rel.fotos.get(m.id) ?? [],
    [],
  )
}

export interface DadosMemorial {
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
    tipo: string
    localNome: string
    endereco: string | null
    inicioISO: string | null
    horarioConfirmado: boolean
  }[]
  fotos: { url: string; alt: string | null }[]
}

function slugify(s: string): string {
  return s
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80)
}

async function slugUnico(
  env: Env,
  tenantId: string,
  base: string,
  ignorarId?: string,
): Promise<string> {
  const raiz = slugify(base) || 'memorial'
  let slug = raiz
  let n = 1
  for (;;) {
    const existe = await env.DB.prepare(
      `SELECT id FROM memorial WHERE tenant_id = ? AND slug = ? AND id != ? LIMIT 1`,
    )
      .bind(tenantId, slug, ignorarId ?? '')
      .first()
    if (!existe) return slug
    n += 1
    slug = `${raiz}-${n}`
  }
}

async function gravarEventosFotos(
  env: Env,
  memorialId: string,
  d: DadosMemorial,
): Promise<void> {
  await env.DB.prepare(`DELETE FROM evento WHERE memorial_id = ?`)
    .bind(memorialId)
    .run()
  await env.DB.prepare(`DELETE FROM foto WHERE memorial_id = ?`)
    .bind(memorialId)
    .run()
  const stmts: D1PreparedStatement[] = []
  d.eventos.forEach((e, i) => {
    stmts.push(
      env.DB.prepare(
        `INSERT INTO evento (id, memorial_id, tipo, local_nome, endereco, inicio_iso, horario_confirmado, ordem)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ).bind(
        crypto.randomUUID(),
        memorialId,
        e.tipo,
        e.localNome,
        e.endereco,
        e.inicioISO,
        e.horarioConfirmado ? 1 : 0,
        i,
      ),
    )
  })
  d.fotos.forEach((f, i) => {
    stmts.push(
      env.DB.prepare(
        `INSERT INTO foto (id, memorial_id, url, alt, ordem) VALUES (?, ?, ?, ?, ?)`,
      ).bind(crypto.randomUUID(), memorialId, f.url, f.alt, i),
    )
  })
  if (stmts.length) await env.DB.batch(stmts)
}

export async function inserirMemorial(
  env: Env,
  tenantId: string,
  d: DadosMemorial,
): Promise<{ id: string; slug: string }> {
  const id = crypto.randomUUID()
  const slug = await slugUnico(env, tenantId, d.nomeCompleto)
  await env.DB.prepare(
    `INSERT INTO memorial (id, tenant_id, slug, nome_completo, apelido, foto_url,
      nascimento_iso, cidade_nascimento, falecimento_iso, cidade_falecimento, idade,
      epitafio, historia, autorizado_por, moderar_mensagens, whatsapp_texto, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'rascunho')`,
  )
    .bind(
      id,
      tenantId,
      slug,
      d.nomeCompleto,
      d.apelido,
      d.fotoUrl,
      d.nascimentoISO,
      d.cidadeNascimento,
      d.falecimentoISO,
      d.cidadeFalecimento,
      d.idade,
      d.epitafio,
      d.historia,
      d.autorizadoPor,
      d.moderarMensagens ? 1 : 0,
      d.whatsappTexto,
    )
    .run()
  await gravarEventosFotos(env, id, d)
  return { id, slug }
}

export async function atualizarMemorial(
  env: Env,
  tenantId: string,
  id: string,
  d: DadosMemorial,
): Promise<string | null> {
  const existe = await env.DB.prepare(
    `SELECT id FROM memorial WHERE tenant_id = ? AND id = ? LIMIT 1`,
  )
    .bind(tenantId, id)
    .first()
  if (!existe) return null
  const slug = await slugUnico(env, tenantId, d.nomeCompleto, id)
  await env.DB.prepare(
    `UPDATE memorial SET slug = ?, nome_completo = ?, apelido = ?, foto_url = ?,
      nascimento_iso = ?, cidade_nascimento = ?, falecimento_iso = ?,
      cidade_falecimento = ?, idade = ?, epitafio = ?, historia = ?,
      autorizado_por = ?, moderar_mensagens = ?, whatsapp_texto = ?
     WHERE tenant_id = ? AND id = ?`,
  )
    .bind(
      slug,
      d.nomeCompleto,
      d.apelido,
      d.fotoUrl,
      d.nascimentoISO,
      d.cidadeNascimento,
      d.falecimentoISO,
      d.cidadeFalecimento,
      d.idade,
      d.epitafio,
      d.historia,
      d.autorizadoPor,
      d.moderarMensagens ? 1 : 0,
      d.whatsappTexto,
      tenantId,
      id,
    )
    .run()
  await gravarEventosFotos(env, id, d)
  return slug
}

export async function publicarMemorial(
  env: Env,
  tenantId: string,
  id: string,
  publicar: boolean,
): Promise<boolean> {
  const novo = publicar ? 'publicado' : 'rascunho'
  const r = await env.DB.prepare(
    `UPDATE memorial SET status = ?,
      publicado_em = CASE WHEN ? = 'publicado' THEN datetime('now') ELSE publicado_em END
     WHERE tenant_id = ? AND id = ?`,
  )
    .bind(novo, novo, tenantId, id)
    .run()
  return (r.meta.changes ?? 0) > 0
}

/** URLs de foto (principal + álbum) de um memorial, para limpeza no R2. */
export async function getUrlsFotosMemorial(
  env: Env,
  tenantId: string,
  id: string,
): Promise<string[]> {
  const urls: string[] = []
  const m = await env.DB.prepare(
    `SELECT foto_url FROM memorial WHERE tenant_id = ? AND id = ? LIMIT 1`,
  )
    .bind(tenantId, id)
    .first<{ foto_url: string | null }>()
  if (m?.foto_url) urls.push(m.foto_url)
  const fotos = await env.DB.prepare(`SELECT url FROM foto WHERE memorial_id = ?`)
    .bind(id)
    .all<{ url: string }>()
  for (const f of fotos.results) urls.push(f.url)
  return urls
}

export async function deletarMemorial(
  env: Env,
  tenantId: string,
  id: string,
): Promise<boolean> {
  const r = await env.DB.prepare(
    `DELETE FROM memorial WHERE tenant_id = ? AND id = ?`,
  )
    .bind(tenantId, id)
    .run()
  return (r.meta.changes ?? 0) > 0
}

/** Remove objetos do R2 a partir das URLs /api/fotos/<key>. */
export async function apagarFotosR2(env: Env, urls: string[]): Promise<void> {
  const chaves = urls
    .filter((u) => u.startsWith('/api/fotos/'))
    .map((u) => u.slice('/api/fotos/'.length))
    .filter((k) => /^[a-zA-Z0-9._-]+$/.test(k))
  await Promise.all(chaves.map((k) => env.PHOTOS.delete(k)))
}

/* ===================== ADMIN: MODERAÇÃO ===================== */

export interface HomenagemPendente {
  id: string
  nome: string
  texto: string | null
  vela: boolean
  criadoEmISO: string
  memorialSlug: string
  memorialNome: string
}

export async function listHomenagensPendentes(
  env: Env,
  tenantId: string,
): Promise<HomenagemPendente[]> {
  const rows = await env.DB.prepare(
    `SELECT h.id, h.nome, h.texto, h.vela, h.criado_em, m.slug AS mslug, m.nome_completo AS mnome
     FROM homenagem h JOIN memorial m ON m.id = h.memorial_id
     WHERE h.tenant_id = ? AND h.status = 'pendente'
     ORDER BY h.criado_em ASC`,
  )
    .bind(tenantId)
    .all<{
      id: string
      nome: string
      texto: string | null
      vela: number
      criado_em: string
      mslug: string
      mnome: string
    }>()
  return rows.results.map((r) => ({
    id: r.id,
    nome: r.nome,
    texto: r.texto,
    vela: !!r.vela,
    criadoEmISO: r.criado_em,
    memorialSlug: r.mslug,
    memorialNome: r.mnome,
  }))
}

export async function getHomenagemDoTenant(
  env: Env,
  tenantId: string,
  id: string,
): Promise<{ id: string } | null> {
  return (
    (await env.DB.prepare(
      `SELECT id FROM homenagem WHERE tenant_id = ? AND id = ? LIMIT 1`,
    )
      .bind(tenantId, id)
      .first<{ id: string }>()) ?? null
  )
}
