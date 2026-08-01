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

/** Hash do IP do cliente (com sal fixo) para rate-limit/abuso sem PII crua. */
export async function ipHash(request: Request): Promise<string | null> {
  const ip =
    request.headers.get('cf-connecting-ip') ??
    request.headers.get('x-forwarded-for') ??
    null
  if (!ip) return null
  return (await sha256Hex(`memorial:${ip}`)).slice(0, 32)
}
