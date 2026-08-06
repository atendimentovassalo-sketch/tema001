/* GET /api/publico/cidades — cidades cobertas pelo guarda-chuva.
 * Alimenta a home nacional. Só cidades com nota publicada: cidade vazia não
 * vira URL. */
import type { Env } from '../../_lib/types'
import { listCidadesComNotas } from '../../_lib/umbrella'
import { json } from '../../_lib/http'

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const cidades = await listCidadesComNotas(env)
  return json({ cidades })
}
