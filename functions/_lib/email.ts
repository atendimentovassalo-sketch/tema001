/* Envio de e-mail transacional via Resend. Sem RESEND_API_KEY configurado,
 * vira no-op (retorna false) — o fluxo que chama segue sem erro. */
import type { Env } from './types'

export interface EmailParams {
  para: string
  assunto: string
  html: string
  texto?: string
}

export async function enviarEmail(env: Env, p: EmailParams): Promise<boolean> {
  if (!env.RESEND_API_KEY) return false
  const from = env.EMAIL_FROM || 'Painel <onboarding@resend.dev>'
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${env.RESEND_API_KEY}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [p.para],
        subject: p.assunto,
        html: p.html,
        ...(p.texto ? { text: p.texto } : {}),
      }),
    })
    return res.ok
  } catch {
    return false
  }
}

/** Conteúdo do e-mail de redefinição de senha. */
export function emailRecuperacao(
  nomeFuneraria: string,
  link: string,
): { assunto: string; html: string; texto: string } {
  const assunto = `Redefinição de senha — Painel ${nomeFuneraria}`
  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;color:#211d17;line-height:1.6">
    <h2 style="font-weight:normal;color:#211d17">Redefinição de senha</h2>
    <p>Recebemos um pedido para redefinir a senha do painel de <b>${nomeFuneraria}</b>.</p>
    <p style="margin:24px 0">
      <a href="${link}" style="background:#b5623f;color:#fff;text-decoration:none;padding:12px 22px;border-radius:2px;display:inline-block">Definir uma nova senha</a>
    </p>
    <p style="font-size:14px;color:#6c6458">O link vale por 1 hora. Se não foi você, ignore este e-mail — sua senha continua a mesma.</p>
  </div>`
  const texto = `Redefinição de senha — ${nomeFuneraria}

Abra este link para definir uma nova senha (vale 1 hora):
${link}

Se não foi você, ignore este e-mail — sua senha continua a mesma.`
  return { assunto, html, texto }
}

/** Conteúdo do e-mail de convite para o painel (1º acesso). */
export function emailConvite(
  nomeFuneraria: string,
  nomeConvidado: string,
  link: string,
): { assunto: string; html: string; texto: string } {
  const assunto = `Seu acesso ao painel — ${nomeFuneraria}`
  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;color:#211d17;line-height:1.6">
    <h2 style="font-weight:normal;color:#211d17">Bem-vindo(a), ${nomeConvidado}</h2>
    <p>Você foi cadastrado(a) no painel de <b>${nomeFuneraria}</b>, onde as notas de
      falecimento são publicadas e as homenagens moderadas.</p>
    <p style="margin:24px 0">
      <a href="${link}" style="background:#b5623f;color:#fff;text-decoration:none;padding:12px 22px;border-radius:2px;display:inline-block">Definir minha senha</a>
    </p>
    <p style="font-size:14px;color:#6c6458">O link vale por 7 dias e só pode ser usado uma vez.
      Ninguém além de você conhece a senha que escolher.</p>
  </div>`
  const texto = `Bem-vindo(a), ${nomeConvidado}

Você foi cadastrado(a) no painel de ${nomeFuneraria}.
Defina sua senha neste link (vale 7 dias, uso único):
${link}`
  return { assunto, html, texto }
}
