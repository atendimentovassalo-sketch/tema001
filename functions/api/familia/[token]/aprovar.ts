/* POST /api/familia/:token/aprovar -> a família libera a nota e ela vai ao ar.
 *
 * DECISÃO (18/08/2026, do Felipe, entre três caminhos): aprovar **publica na
 * hora**, registra o aval e avisa a funerária. O argumento é o do velório — a
 * nota precisa circular, e esperar a funerária voltar ao painel é tempo que
 * ninguém tem. A funerária não perde o controle: o painel marca a nota como
 * publicada pela família, e despublicar continua sendo um clique dela.
 *
 * O aviso é BEST-EFFORT: sem RESEND_API_KEY configurado o e-mail simplesmente
 * não sai, e a aprovação não pode falhar por causa disso — a família fez a
 * parte dela. O registro no banco é a fonte de verdade; o e-mail é cortesia.
 */
import { z } from 'zod'
import type { Env } from '../../../_lib/types'
import {
  getAcessoFamilia,
  getTenantPorId,
  aprovarPelaFamilia,
  emailsDaFuneraria,
} from '../../../_lib/db'
import { enviarEmail } from '../../../_lib/email'
import { json, erro, lerJson } from '../../../_lib/http'

const schema = z.object({
  nome: z.string().trim().min(1, 'Diga seu nome.').max(90),
  parentesco: z.string().trim().max(60).optional().default(''),
})

export const onRequestPost: PagesFunction<Env> = async ({
  env,
  request,
  params,
}) => {
  const acesso = await getAcessoFamilia(env, String(params.token))
  if (!acesso) return erro('Link inválido ou vencido.', 404)

  let body: unknown
  try {
    body = await lerJson(request, 8_192)
  } catch {
    return erro('Requisição inválida.', 400)
  }
  const parsed = schema.safeParse(body)
  if (!parsed.success)
    return erro(parsed.error.issues[0]?.message ?? 'Dados inválidos.', 422)

  const { nome, parentesco } = parsed.data
  /* Mesmo formato que a funerária já usa no editor e que o rodapé da nota
   * imprime: "Fulano (Neta)". Sem parentesco, só o nome. */
  const autorizadoPor = parentesco ? `${nome} (${parentesco})` : nome

  await aprovarPelaFamilia(env, acesso.memorialId, autorizadoPor)

  const tenant = await getTenantPorId(env, acesso.tenantId)
  if (tenant) {
    const destinos = await emailsDaFuneraria(env, acesso.tenantId)
    /* Mesma origem do pedido — é assim que o resto das Functions monta link
     * absoluto (convite, recuperação de senha). O Worker repassa o host da
     * cliente, então o e-mail sai com o endereço que a funerária conhece. */
    const url = `${new URL(request.url).origin}/m/${acesso.slug}`
    await Promise.all(
      destinos.map((para) =>
        enviarEmail(env, {
          para,
          assunto: `Família aprovou a nota de ${acesso.nomeCompleto}`,
          html: `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;color:#211d17;line-height:1.6">
    <h2 style="font-weight:normal">A nota de ${acesso.nomeCompleto} está no ar</h2>
    <p><b>${autorizadoPor}</b> conferiu a página pelo link da família e liberou a publicação.</p>
    <p style="margin:24px 0"><a href="${url}" style="background:#8a6828;color:#fff;text-decoration:none;padding:12px 22px;border-radius:2px;display:inline-block">Ver a nota</a></p>
    <p style="font-size:14px;color:#6c6458">Se algo estiver errado, você pode despublicar pelo painel a qualquer momento.</p>
  </div>`,
          texto: `A nota de ${acesso.nomeCompleto} está no ar.

${autorizadoPor} conferiu a página pelo link da família e liberou a publicação.
${url}

Se algo estiver errado, dá para despublicar pelo painel.`,
        }),
      ),
    )
  }

  return json({ ok: true, autorizadoPor, slug: acesso.slug })
}
