/* Cliente da API (mesma origem; cookies de sessão viajam automaticamente).
 * Em dev, o Vite faz proxy de /api -> wrangler pages dev. */

export class ApiError extends Error {
  status: number
  campo?: string
  constructor(mensagem: string, status: number, campo?: string) {
    super(mensagem)
    this.name = 'ApiError'
    this.status = status
    this.campo = campo
  }
}

async function req<T>(url: string, init: RequestInit): Promise<T> {
  const res = await fetch(url, {
    credentials: 'same-origin',
    ...init,
  })
  const tipo = res.headers.get('content-type') ?? ''
  const corpo = tipo.includes('application/json') ? await res.json() : null
  if (!res.ok) {
    const msg = (corpo && corpo.erro) || `Erro ${res.status}`
    throw new ApiError(msg, res.status, corpo?.campo)
  }
  return corpo as T
}

function comJson(body?: unknown): RequestInit {
  return {
    headers: { 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  }
}

export const api = {
  get: <T>(url: string) => req<T>(url, { method: 'GET' }),
  post: <T>(url: string, body?: unknown) =>
    req<T>(url, { method: 'POST', ...comJson(body) }),
  put: <T>(url: string, body?: unknown) =>
    req<T>(url, { method: 'PUT', ...comJson(body) }),
  del: <T>(url: string) => req<T>(url, { method: 'DELETE' }),
  /** Upload de imagem (bytes crus). Retorna a URL servível. */
  upload: (url: string, blob: Blob) =>
    req<{ ok: true; url: string }>(url, {
      method: 'POST',
      headers: { 'content-type': blob.type || 'application/octet-stream' },
      body: blob,
    }),
}
