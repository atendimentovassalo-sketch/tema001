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

/**
 * Resolve o tenant pelo domínio público da requisição.
 * Prefere o host reencaminhado pelo Worker-proxy (header `x-tenant-host`); cai
 * para `x-forwarded-host`, depois o `Host`, depois o host da URL. Normaliza
 * (minúsculas, sem `www.`, sem porta).
 *
 * Fallback de transição: se NÃO houver correspondência e existir só 1 tenant,
 * devolve-o (mantém compatibilidade enquanto os domínios não estão preenchidos).
 * Com 2+ tenants e host desconhecido, devolve null — nunca "vaza" o tenant errado.
 */
export async function getTenantPorHost(
  env: Env,
  request: Request,
): Promise<TenantRow | null> {
  const host = (
    request.headers.get('x-tenant-host') ??
    request.headers.get('x-forwarded-host') ??
    request.headers.get('host') ??
    new URL(request.url).hostname
  )
    .toLowerCase()
    .replace(/^www\./, '')
    .split(':')[0]

  const porHost = await env.DB.prepare(
    'SELECT * FROM tenant WHERE dominio = ? LIMIT 1',
  )
    .bind(host)
    .first<TenantRow>()
  if (porHost) return porHost

  const total = await env.DB.prepare(
    'SELECT COUNT(*) AS n FROM tenant',
  ).first<{ n: number }>()
  if ((total?.n ?? 0) <= 1) return getTenant(env)
  return null
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
    /* Coluna acrescentada pela migration 0009: o `?? 1` cobre a janela entre o
     * deploy do código e a aplicação da migration, e tenants antigos. */
    diaInicioCiclo: (t as { dia_inicio_ciclo?: number }).dia_inicio_ciclo ?? 1,
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
      whatsapp_template = ?, dia_inicio_ciclo = ? WHERE id = ?`,
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
      c.diaInicioCiclo,
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
    `SELECT * FROM memorial WHERE tenant_id = ? AND slug = ? AND status = 'publicado' LIMIT 1`,
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

/* ----- rate-limit do login (força bruta) ----- */

/** Quantas tentativas FALHADAS este par (IP, e-mail) somou nos últimos N segundos. */
export async function contarFalhasLoginRecentes(
  env: Env,
  ipHashValor: string,
  emailHashValor: string,
  segundos: number,
): Promise<number> {
  const row = await env.DB.prepare(
    `SELECT count(*) AS n FROM login_tentativa
     WHERE ip_hash = ? AND email_hash = ? AND criado_em > datetime('now', ?)`,
  )
    .bind(ipHashValor, emailHashValor, `-${segundos} seconds`)
    .first<{ n: number }>()
  return row?.n ?? 0
}

/** Registra uma tentativa que falhou e aproveita para varrer linhas velhas. */
export async function registrarFalhaLogin(
  env: Env,
  ipHashValor: string,
  emailHashValor: string,
): Promise<void> {
  await env.DB.prepare(
    `INSERT INTO login_tentativa (id, ip_hash, email_hash) VALUES (?, ?, ?)`,
  )
    .bind(crypto.randomUUID(), ipHashValor, emailHashValor)
    .run()
  // limpeza oportunista: a tabela só serve à janela de minutos, não é auditoria.
  // Roda só no caminho de falha, que é raro — não onera o login que dá certo.
  await env.DB.prepare(
    `DELETE FROM login_tentativa WHERE criado_em < datetime('now', '-1 day')`,
  ).run()
}

/** Zera o histórico de falhas do par após um login bem-sucedido. */
export async function limparFalhasLogin(
  env: Env,
  ipHashValor: string,
  emailHashValor: string,
): Promise<void> {
  await env.DB.prepare(
    `DELETE FROM login_tentativa WHERE ip_hash = ? AND email_hash = ?`,
  )
    .bind(ipHashValor, emailHashValor)
    .run()
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

/* ---------- gestão: clientes e financeiro ---------- */
/* Módulo autorizado em 17/08/2026 com fronteira explícita: sem nada fiscal e
 * sem estoque. Ver migrations/0008_gestao.sql para as decisões do esquema.
 * Toda consulta aqui filtra por tenant_id — é o dado mais sensível do produto. */

export interface ClienteDTO {
  id: string
  nome: string
  telefone: string | null
  documento: string | null
  endereco: string | null
  observacao: string | null
  planoAtivo: boolean
  planoValorCentavos: number | null
  planoDiaVencimento: number | null
  planoInicio: string | null
  ativo: boolean
  criadoEmISO: string
}

interface ClienteRow {
  id: string
  nome: string
  telefone: string | null
  documento: string | null
  endereco: string | null
  observacao: string | null
  plano_ativo: number
  plano_valor_centavos: number | null
  plano_dia_vencimento: number | null
  plano_inicio: string | null
  ativo: number
  criado_em: string
}

function toClienteDTO(r: ClienteRow): ClienteDTO {
  return {
    id: r.id,
    nome: r.nome,
    telefone: r.telefone,
    documento: r.documento,
    endereco: r.endereco,
    observacao: r.observacao,
    planoAtivo: !!r.plano_ativo,
    planoValorCentavos: r.plano_valor_centavos,
    planoDiaVencimento: r.plano_dia_vencimento,
    planoInicio: r.plano_inicio,
    ativo: !!r.ativo,
    criadoEmISO: r.criado_em,
  }
}

export interface ClienteInput {
  nome: string
  telefone: string | null
  documento: string | null
  endereco: string | null
  observacao: string | null
  planoAtivo: boolean
  planoValorCentavos: number | null
  planoDiaVencimento: number | null
  planoInicio: string | null
}

export async function listClientes(
  env: Env,
  tenantId: string,
  incluirInativos = false,
): Promise<ClienteDTO[]> {
  const rows = await env.DB.prepare(
    `SELECT * FROM cliente
      WHERE tenant_id = ? ${incluirInativos ? '' : 'AND ativo = 1'}
      ORDER BY nome COLLATE NOCASE`,
  )
    .bind(tenantId)
    .all<ClienteRow>()
  return rows.results.map(toClienteDTO)
}

export async function getCliente(
  env: Env,
  tenantId: string,
  id: string,
): Promise<ClienteDTO | null> {
  const row = await env.DB.prepare(
    `SELECT * FROM cliente WHERE tenant_id = ? AND id = ? LIMIT 1`,
  )
    .bind(tenantId, id)
    .first<ClienteRow>()
  return row ? toClienteDTO(row) : null
}

export async function inserirCliente(
  env: Env,
  tenantId: string,
  d: ClienteInput,
): Promise<string> {
  const id = crypto.randomUUID()
  await env.DB.prepare(
    `INSERT INTO cliente
       (id, tenant_id, nome, telefone, documento, endereco, observacao,
        plano_ativo, plano_valor_centavos, plano_dia_vencimento, plano_inicio)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      id, tenantId, d.nome, d.telefone, d.documento, d.endereco, d.observacao,
      d.planoAtivo ? 1 : 0, d.planoValorCentavos, d.planoDiaVencimento, d.planoInicio,
    )
    .run()
  return id
}

export async function atualizarCliente(
  env: Env,
  tenantId: string,
  id: string,
  d: ClienteInput,
): Promise<boolean> {
  const r = await env.DB.prepare(
    `UPDATE cliente
        SET nome = ?, telefone = ?, documento = ?, endereco = ?, observacao = ?,
            plano_ativo = ?, plano_valor_centavos = ?, plano_dia_vencimento = ?,
            plano_inicio = ?
      WHERE tenant_id = ? AND id = ?`,
  )
    .bind(
      d.nome, d.telefone, d.documento, d.endereco, d.observacao,
      d.planoAtivo ? 1 : 0, d.planoValorCentavos, d.planoDiaVencimento, d.planoInicio,
      tenantId, id,
    )
    .run()
  return (r.meta.changes ?? 0) > 0
}

/** Arquivar, nunca apagar: o cliente tem lançamentos e histórico atrelados. */
export async function arquivarCliente(
  env: Env,
  tenantId: string,
  id: string,
): Promise<boolean> {
  const r = await env.DB.prepare(
    `UPDATE cliente SET ativo = 0, plano_ativo = 0 WHERE tenant_id = ? AND id = ?`,
  )
    .bind(tenantId, id)
    .run()
  return (r.meta.changes ?? 0) > 0
}

/* ----- financeiro ----- */

export interface LancamentoDTO {
  id: string
  clienteId: string | null
  clienteNome: string | null
  tipo: 'entrada' | 'saida'
  categoria: string
  descricao: string | null
  valorCentavos: number
  competencia: string
  vencimento: string | null
  pagoEm: string | null
  criadoEmISO: string
}

interface LancamentoRow {
  id: string
  cliente_id: string | null
  cliente_nome: string | null
  tipo: 'entrada' | 'saida'
  categoria: string
  descricao: string | null
  valor_centavos: number
  competencia: string
  vencimento: string | null
  pago_em: string | null
  criado_em: string
}

function toLancamentoDTO(r: LancamentoRow): LancamentoDTO {
  return {
    id: r.id,
    clienteId: r.cliente_id,
    clienteNome: r.cliente_nome,
    tipo: r.tipo,
    categoria: r.categoria,
    descricao: r.descricao,
    valorCentavos: r.valor_centavos,
    competencia: r.competencia,
    vencimento: r.vencimento,
    pagoEm: r.pago_em,
    criadoEmISO: r.criado_em,
  }
}

const SELECT_LANCAMENTO = `
  SELECT l.id, l.cliente_id, c.nome AS cliente_nome, l.tipo, l.categoria,
         l.descricao, l.valor_centavos, l.competencia, l.vencimento,
         l.pago_em, l.criado_em
    FROM lancamento l
    LEFT JOIN cliente c ON c.id = l.cliente_id AND c.tenant_id = l.tenant_id`

export async function listLancamentos(
  env: Env,
  tenantId: string,
  competencia: string,
): Promise<LancamentoDTO[]> {
  const rows = await env.DB.prepare(
    `${SELECT_LANCAMENTO}
      WHERE l.tenant_id = ? AND l.competencia = ?
      ORDER BY (l.pago_em IS NOT NULL), l.vencimento IS NULL, l.vencimento, l.criado_em`,
  )
    .bind(tenantId, competencia)
    .all<LancamentoRow>()
  return rows.results.map(toLancamentoDTO)
}

/** Em aberto de qualquer mês, vencidos primeiro — é a tela que a dona olha. */
export async function listEmAberto(
  env: Env,
  tenantId: string,
  limite = 200,
): Promise<LancamentoDTO[]> {
  const rows = await env.DB.prepare(
    `${SELECT_LANCAMENTO}
      WHERE l.tenant_id = ? AND l.pago_em IS NULL
      ORDER BY l.vencimento IS NULL, l.vencimento, l.competencia
      LIMIT ?`,
  )
    .bind(tenantId, limite)
    .all<LancamentoRow>()
  return rows.results.map(toLancamentoDTO)
}

export interface LancamentoInput {
  clienteId: string | null
  tipo: 'entrada' | 'saida'
  categoria: string
  descricao: string | null
  valorCentavos: number
  competencia: string
  vencimento: string | null
  pagoEm: string | null
}

export async function inserirLancamento(
  env: Env,
  tenantId: string,
  d: LancamentoInput,
): Promise<string> {
  const id = crypto.randomUUID()
  await env.DB.prepare(
    `INSERT INTO lancamento
       (id, tenant_id, cliente_id, tipo, categoria, descricao, valor_centavos,
        competencia, vencimento, pago_em)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      id, tenantId, d.clienteId, d.tipo, d.categoria, d.descricao,
      d.valorCentavos, d.competencia, d.vencimento, d.pagoEm,
    )
    .run()
  return id
}

/** Marca pago (data 'AAAA-MM-DD') ou reabre (null). */
export async function definirPagamento(
  env: Env,
  tenantId: string,
  id: string,
  pagoEm: string | null,
): Promise<boolean> {
  const r = await env.DB.prepare(
    `UPDATE lancamento SET pago_em = ? WHERE tenant_id = ? AND id = ?`,
  )
    .bind(pagoEm, tenantId, id)
    .run()
  return (r.meta.changes ?? 0) > 0
}

export async function excluirLancamento(
  env: Env,
  tenantId: string,
  id: string,
): Promise<boolean> {
  const r = await env.DB.prepare(
    `DELETE FROM lancamento WHERE tenant_id = ? AND id = ?`,
  )
    .bind(tenantId, id)
    .run()
  return (r.meta.changes ?? 0) > 0
}

/** Gera as mensalidades do mês para todo plano ativo. Repetível: o índice único
 *  parcial (ver migration 0008, decisão 5) recusa a segunda geração do mesmo
 *  mês, então clicar duas vezes não duplica cobrança. */
export async function gerarMensalidades(
  env: Env,
  tenantId: string,
  competencia: string,
): Promise<number> {
  const clientes = await env.DB.prepare(
    `SELECT id, plano_valor_centavos, plano_dia_vencimento
       FROM cliente
      WHERE tenant_id = ? AND ativo = 1 AND plano_ativo = 1
        AND plano_valor_centavos IS NOT NULL`,
  )
    .bind(tenantId)
    .all<{ id: string; plano_valor_centavos: number; plano_dia_vencimento: number | null }>()

  let criados = 0
  for (const c of clientes.results) {
    const dia = String(c.plano_dia_vencimento ?? 10).padStart(2, '0')
    const r = await env.DB.prepare(
      `INSERT OR IGNORE INTO lancamento
         (id, tenant_id, cliente_id, tipo, categoria, descricao, valor_centavos,
          competencia, vencimento, pago_em)
       VALUES (?, ?, ?, 'entrada', 'mensalidade', 'Mensalidade do plano', ?, ?, ?, NULL)`,
    )
      .bind(
        crypto.randomUUID(), tenantId, c.id, c.plano_valor_centavos,
        competencia, `${competencia}-${dia}`,
      )
      .run()
    criados += r.meta.changes ?? 0
  }
  return criados
}

export interface ResumoFinanceiro {
  competencia: string
  entradasCentavos: number
  saidasCentavos: number
  recebidoCentavos: number
  aReceberCentavos: number
  clientesComPlano: number
}

export async function getResumoFinanceiro(
  env: Env,
  tenantId: string,
  competencia: string,
): Promise<ResumoFinanceiro> {
  const t = await env.DB.prepare(
    `SELECT
       COALESCE(SUM(CASE WHEN tipo = 'entrada' THEN valor_centavos END), 0) AS entradas,
       COALESCE(SUM(CASE WHEN tipo = 'saida'   THEN valor_centavos END), 0) AS saidas,
       COALESCE(SUM(CASE WHEN tipo = 'entrada' AND pago_em IS NOT NULL
                         THEN valor_centavos END), 0) AS recebido,
       COALESCE(SUM(CASE WHEN tipo = 'entrada' AND pago_em IS NULL
                         THEN valor_centavos END), 0) AS a_receber
     FROM lancamento WHERE tenant_id = ? AND competencia = ?`,
  )
    .bind(tenantId, competencia)
    .first<{ entradas: number; saidas: number; recebido: number; a_receber: number }>()

  const p = await env.DB.prepare(
    `SELECT count(*) AS n FROM cliente
      WHERE tenant_id = ? AND ativo = 1 AND plano_ativo = 1`,
  )
    .bind(tenantId)
    .first<{ n: number }>()

  return {
    competencia,
    entradasCentavos: t?.entradas ?? 0,
    saidasCentavos: t?.saidas ?? 0,
    recebidoCentavos: t?.recebido ?? 0,
    aReceberCentavos: t?.a_receber ?? 0,
    clientesComPlano: p?.n ?? 0,
  }
}
