/* GET /api/funeraria — quem é a funerária deste domínio.
 *
 * Existe porque três telas precisam do inquilino e nenhuma delas tem memorial
 * nem sessão: /privacidade, /termos (documentos jurídicos, que nomeiam o
 * controlador dos dados) e /admin/login (a logo, antes de qualquer senha).
 * Até aqui elas chamavam `/api/memoriais?limite=1` e jogavam fora a lista de
 * falecimentos só para ler o cabeçalho — caro e esquisito.
 *
 * Público de propósito: tudo que devolve já está impresso no rodapé de toda
 * página do site. Sem host correspondente devolve `null` em vez do primeiro
 * inquilino — a página cai no texto neutro, e nunca no nome de outra casa. */
import type { Env } from '../_lib/types'
import { getTenantPorHost, toFunerariaDTO } from '../_lib/db'
import { json } from '../_lib/http'

export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  const tenant = await getTenantPorHost(env, request)
  return json({ funeraria: tenant ? toFunerariaDTO(tenant) : null })
}
