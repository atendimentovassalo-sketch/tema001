/* Autenticação: hash de senha (PBKDF2-SHA256, Web Crypto), sessão em D1 e
 * cookie httpOnly. A família não loga; isto é só para o admin da funerária. */
import type { Env } from './types'
import { tokenAleatorio } from './http'

// O Cloudflare Workers limita PBKDF2 a no máximo 100.000 iterações; acima
// disso o crypto.subtle.deriveBits lança em produção (workerd local não impõe).
const ITERACOES = 100_000
const COOKIE = 'sessao'

function hex(buf: ArrayBuffer | Uint8Array): string {
  const arr = buf instanceof Uint8Array ? buf : new Uint8Array(buf)
  return [...arr].map((b) => b.toString(16).padStart(2, '0')).join('')
}
function desHex(s: string): Uint8Array {
  const out = new Uint8Array(s.length / 2)
  for (let i = 0; i < out.length; i++) out[i] = parseInt(s.slice(i * 2, i * 2 + 2), 16)
  return out
}

async function pbkdf2(senha: string, salt: Uint8Array): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(senha),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: ITERACOES, hash: 'SHA-256' },
    key,
    256,
  )
  return hex(bits)
}

export async function hashSenha(
  senha: string,
): Promise<{ hash: string; salt: string }> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  return { hash: await pbkdf2(senha, salt), salt: hex(salt) }
}

/** Comparação em tempo constante. */
function igualdadeSegura(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

export async function verificarSenha(
  senha: string,
  hashHex: string | null,
  saltHex: string | null,
): Promise<boolean> {
  if (!hashHex || !saltHex) return false
  const calc = await pbkdf2(senha, desHex(saltHex))
  return igualdadeSegura(calc, hashHex)
}

/* ----- sessão ----- */

export function ttlHoras(env: Env): number {
  return Number(env.SESSION_TTL_HOURS ?? '168') // 7 dias
}

export function novoTokenSessao(): string {
  return tokenAleatorio(32)
}

export function cookieSessao(token: string, maxAgeSec: number, secure: boolean): string {
  const flags = [
    `${COOKIE}=${token}`,
    'HttpOnly',
    'SameSite=Lax',
    'Path=/',
    `Max-Age=${maxAgeSec}`,
  ]
  if (secure) flags.push('Secure')
  return flags.join('; ')
}

export function cookieLimpar(secure: boolean): string {
  const flags = [`${COOKIE}=`, 'HttpOnly', 'SameSite=Lax', 'Path=/', 'Max-Age=0']
  if (secure) flags.push('Secure')
  return flags.join('; ')
}

export function lerTokenSessao(request: Request): string | null {
  const raw = request.headers.get('cookie')
  if (!raw) return null
  for (const parte of raw.split(';')) {
    const [k, ...v] = parte.trim().split('=')
    if (k === COOKIE) return v.join('=') || null
  }
  return null
}

export function requisicaoSegura(request: Request): boolean {
  return new URL(request.url).protocol === 'https:'
}
