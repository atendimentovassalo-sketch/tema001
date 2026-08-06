/* Consultas do guarda-chuva multi-tenant (fase U1) — agnósticas de domínio.
 *
 * A diferença essencial em relação a `db.ts`: aqui o tenant é resolvido PELA
 * NOTA, nunca pelo host. `getTenantPorHost` devolve null quando o host não é de
 * nenhum tenant (comportamento correto para não vazar tenant errado), e o
 * guarda-chuva é exatamente esse caso — logo, nenhuma rota deste arquivo pode
 * depender dela.
 *
 * NENHUM domínio é escrito aqui: as consultas são agnósticas de host. O nome e o
 * domínio do guarda-chuva ainda não estão definidos (ver Env em `types.ts`).
 *
 * Nada aqui altera o caminho antigo: as rotas por host continuam intactas.
 */
import type {
  Env,
  TenantRow,
  MemorialRow,
  CidadeRow,
  CidadeDTO,
  CidadeComContagemDTO,
  IndiceCidadeDTO,
  NotaIndiceDTO,
  MemorialDTO,
} from './types'
import {
  toFunerariaDTO,
  toMemorialDTO,
  toHomenagemDTO,
  homenagemVisivelPublica,
  carregarRelacionados,
} from './db'

/** Linha crua do índice: memorial + tenant + cidade, achatados pelo JOIN. */
type LinhaIndice = MemorialRow &
  TenantRow & {
    m_id: string
    m_slug: string
    velorio_inicio: string | null
  }

function toCidadeDTO(c: CidadeRow): CidadeDTO {
  return { slug: c.slug, nome: c.nome, uf: c.uf }
}

/* ---------- cidades ---------- */

/**
 * Cidades que têm ao menos uma nota publicada. Cidade sem nota não vira URL:
 * índice vazio é conteúdo raso e derruba o domínio inteiro na busca.
 */
export async function listCidadesComNotas(
  env: Env,
): Promise<CidadeComContagemDTO[]> {
  const { results } = await env.DB.prepare(
    `SELECT c.slug, c.nome, c.uf, COUNT(m.id) AS notas
       FROM cidade c
       JOIN memorial m ON m.cidade_id = c.id AND m.status = 'publicado'
      GROUP BY c.id
     HAVING notas > 0
      ORDER BY c.nome ASC`,
  ).all<{ slug: string; nome: string; uf: string; notas: number }>()
  return results.map((r) => ({
    slug: r.slug,
    nome: r.nome,
    uf: r.uf,
    notas: r.notas,
  }))
}

export async function getCidadePorSlug(
  env: Env,
  slug: string,
): Promise<CidadeRow | null> {
  return (
    (await env.DB.prepare(
      `SELECT id, slug, nome, uf FROM cidade WHERE slug = ? LIMIT 1`,
    )
      .bind(slug)
      .first<CidadeRow>()) ?? null
  )
}

/* ---------- índice da cidade (cross-tenant) ---------- */

/**
 * Notas publicadas de TODAS as funerárias da cidade, mais recentes primeiro.
 *
 * Traz só o que a linha do índice mostra — sem homenagens, fotos ou história.
 * Uma cidade grande tem centenas de notas; carregar o relacionado de cada uma
 * seria caro e nada disso aparece na tela.
 *
 * `velorio_inicio` sai de subconsulta e só considera horário CONFIRMADO: é o que
 * alimenta o selo "Velório hoje", e horário não confirmado não pode virar selo.
 */
export async function listIndiceCidade(
  env: Env,
  cidade: CidadeRow,
  opts: { limite?: number; offset?: number } = {},
): Promise<IndiceCidadeDTO> {
  const limite = Math.min(Math.max(opts.limite ?? 60, 1), 200)
  const offset = Math.max(opts.offset ?? 0, 0)

  const totalRow = await env.DB.prepare(
    `SELECT COUNT(*) AS n FROM memorial
      WHERE cidade_id = ? AND status = 'publicado'`,
  )
    .bind(cidade.id)
    .first<{ n: number }>()

  const { results } = await env.DB.prepare(
    `SELECT m.id           AS m_id,
            m.slug         AS m_slug,
            m.nome_completo, m.foto_url, m.nascimento_iso,
            m.falecimento_iso, m.idade,
            t.*,
            (SELECT MIN(e.inicio_iso) FROM evento e
              WHERE e.memorial_id = m.id
                AND e.tipo = 'velorio'
                AND e.horario_confirmado = 1
                AND e.inicio_iso IS NOT NULL) AS velorio_inicio
       FROM memorial m
       JOIN tenant t ON t.id = m.tenant_id
      WHERE m.cidade_id = ? AND m.status = 'publicado'
      ORDER BY m.falecimento_iso DESC, m.criado_em DESC
      LIMIT ? OFFSET ?`,
  )
    .bind(cidade.id, limite, offset)
    .all<LinhaIndice>()

  const notas: NotaIndiceDTO[] = results.map((r) => ({
    slug: r.m_slug,
    nomeCompleto: r.nome_completo,
    fotoUrl: r.foto_url,
    nascimentoISO: r.nascimento_iso,
    falecimentoISO: r.falecimento_iso,
    idade: r.idade,
    velorioInicioISO: r.velorio_inicio,
    funeraria: toFunerariaDTO(r as unknown as TenantRow),
  }))

  return { cidade: toCidadeDTO(cidade), total: totalRow?.n ?? 0, notas }
}

/* ---------- nota individual (white-label pela funerária dona) ---------- */

/**
 * Uma nota publicada por (cidade, slug), com a funerária DONA da nota.
 * É aqui que o white-label acontece: a marca vem do tenant do memorial, não do
 * domínio que serviu a requisição.
 */
export async function getNotaPorCidadeSlug(
  env: Env,
  cidadeSlug: string,
  notaSlug: string,
): Promise<MemorialDTO | null> {
  const m = await env.DB.prepare(
    `SELECT m.* FROM memorial m
       JOIN cidade c ON c.id = m.cidade_id
      WHERE c.slug = ? AND m.slug = ? AND m.status = 'publicado'
      LIMIT 1`,
  )
    .bind(cidadeSlug, notaSlug)
    .first<MemorialRow>()
  if (!m) return null

  const tenant = await env.DB.prepare(
    `SELECT * FROM tenant WHERE id = ? LIMIT 1`,
  )
    .bind(m.tenant_id)
    .first<TenantRow>()
  if (!tenant) return null

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

/**
 * Dados mínimos para gravar uma homenagem vinda do guarda-chuva.
 * Devolve o tenant_id da NOTA — é o que substitui o `getTenantPorHost` das
 * rotas antigas e corrige o achado (B).
 */
export async function getNotaBasicaPorCidadeSlug(
  env: Env,
  cidadeSlug: string,
  notaSlug: string,
): Promise<{ id: string; tenantId: string; moderar: boolean } | null> {
  const row = await env.DB.prepare(
    `SELECT m.id, m.tenant_id, m.moderar_mensagens FROM memorial m
       JOIN cidade c ON c.id = m.cidade_id
      WHERE c.slug = ? AND m.slug = ? AND m.status = 'publicado'
      LIMIT 1`,
  )
    .bind(cidadeSlug, notaSlug)
    .first<{ id: string; tenant_id: string; moderar_mensagens: number }>()
  if (!row) return null
  return {
    id: row.id,
    tenantId: row.tenant_id,
    moderar: !!row.moderar_mensagens,
  }
}

/** Outras notas da mesma cidade — o bloco de rodapé da nota (decisão D4). */
export async function listOutrasNotasDaCidade(
  env: Env,
  cidadeSlug: string,
  excluirSlug: string,
  limite = 6,
): Promise<NotaIndiceDTO[]> {
  const { results } = await env.DB.prepare(
    `SELECT m.slug AS m_slug, m.nome_completo, m.foto_url, m.nascimento_iso,
            m.falecimento_iso, m.idade, t.*, NULL AS velorio_inicio
       FROM memorial m
       JOIN cidade c ON c.id = m.cidade_id
       JOIN tenant t ON t.id = m.tenant_id
      WHERE c.slug = ? AND m.slug != ? AND m.status = 'publicado'
      ORDER BY m.falecimento_iso DESC
      LIMIT ?`,
  )
    .bind(cidadeSlug, excluirSlug, Math.min(Math.max(limite, 1), 12))
    .all<LinhaIndice>()

  return results.map((r) => ({
    slug: r.m_slug,
    nomeCompleto: r.nome_completo,
    fotoUrl: r.foto_url,
    nascimentoISO: r.nascimento_iso,
    falecimentoISO: r.falecimento_iso,
    idade: r.idade,
    velorioInicioISO: null,
    funeraria: toFunerariaDTO(r as unknown as TenantRow),
  }))
}
