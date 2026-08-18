/* Utilitários HTTP das Functions: respostas JSON, leitura segura de corpo,
 * hash de IP (LGPD: nunca guardar IP cru) e geração de tokens. */

export function json(data: unknown, status = 200, headers: HeadersInit = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      ...headers,
    },
  })
}

export function erro(mensagem: string, status = 400, extra: Record<string, unknown> = {}): Response {
  return json({ erro: mensagem, ...extra }, status)
}

/** Lê JSON do corpo com limite de tamanho (anti-abuso). */
export async function lerJson<T = unknown>(
  request: Request,
  maxBytes = 16_384,
): Promise<T> {
  const buf = await request.arrayBuffer()
  if (buf.byteLength > maxBytes) throw new Error('Corpo grande demais.')
  const txt = new TextDecoder().decode(buf)
  return JSON.parse(txt) as T
}

/** Token aleatório url-safe (base64url de 32 bytes). */
export function tokenAleatorio(bytes = 32): string {
  const arr = new Uint8Array(bytes)
  crypto.getRandomValues(arr)
  return btoa(String.fromCharCode(...arr))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

/** SHA-256 hex de uma string. */
export async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/** Hash do IP do cliente (com sal fixo) para rate-limit/abuso sem PII crua.
 *
 * O `env` NÃO é decorativo. Pelo domínio da funerária o tráfego passa pelo Worker
 * `proxy-obituario`, e o `cf-connecting-ip` que chega aqui é o da borda da
 * Cloudflare — igual para todos os visitantes. Sem tratar isso, todo rate-limit
 * do app deixa de ser "por visitante" e vira "por tenant" (medido em 17/08/2026:
 * a mesma máquina gerava hash diferente entrando direto no pages.dev e entrando
 * pelo domínio da cliente). O Worker passa o IP real em `X-Visitante-IP`, acompanhado
 * de um segredo — porque cabeçalho é texto que qualquer um escreve, e sem a
 * conferência bastaria bater direto no `pages.dev` mandando um IP falso a cada
 * requisição para nunca cair em limite nenhum.
 *
 * Sem `PROXY_SEGREDO` configurado, o cabeçalho é ignorado e vale o comportamento
 * antigo: degrada para "por tenant", não quebra.
 *
 * O cabeçalho NÃO se chama `X-Real-IP`: esse nome é gerenciado pela própria
 * Cloudflare, que o reescreve na borda — medido em 18/08/2026, o valor enviado
 * era descartado e valia o IP de quem chamava. Nome próprio resolve. */
export async function ipHash(
  request: Request,
  env?: { PROXY_SEGREDO?: string },
): Promise<string | null> {
  // Comparação simples basta: este segredo não autentica ninguém, só decide de
  // qual cabeçalho o IP é lido. Errar aqui degrada a granularidade do limite.
  const doProxy =
    env?.PROXY_SEGREDO && request.headers.get('x-proxy-auth') === env.PROXY_SEGREDO
      ? request.headers.get('x-visitante-ip')
      : null

  const ip =
    doProxy ??
    request.headers.get('cf-connecting-ip') ??
    request.headers.get('x-forwarded-for') ??
    null
  if (!ip) return null
  return (await sha256Hex(`memorial:${ip}`)).slice(0, 32)
}
