/* Schemas de validação (Zod) compartilhados pela API administrativa. */
import { z } from 'zod'

export const eventoInputSchema = z.object({
  tipo: z.enum(['velorio', 'cerimonia', 'sepultamento']),
  localNome: z.string().trim().min(1).max(160),
  endereco: z.string().trim().max(200).nullable().default(null),
  inicioISO: z.string().trim().max(40).nullable().default(null),
  horarioConfirmado: z.boolean().default(false),
})

// Aceita URL http(s) OU caminho servido pelo R2 (/api/fotos/...).
const urlFoto = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v.startsWith('/api/fotos/') || /^https?:\/\//.test(v), {
    message: 'URL de foto inválida.',
  })

export const fotoInputSchema = z.object({
  url: urlFoto,
  alt: z.string().trim().max(160).nullable().default(null),
})

export const memorialInputSchema = z.object({
  nomeCompleto: z.string().trim().min(1, 'Informe o nome.').max(160),
  apelido: z.string().trim().max(80).nullable().default(null),
  // foto sobe para o R2 antes; guarda-se o caminho /api/fotos/... ou uma URL http(s)
  fotoUrl: urlFoto.nullable().default(null),
  nascimentoISO: z.string().trim().max(40).nullable().default(null),
  cidadeNascimento: z.string().trim().max(120).nullable().default(null),
  falecimentoISO: z.string().trim().min(1, 'Informe a data de falecimento.').max(40),
  cidadeFalecimento: z.string().trim().max(120).nullable().default(null),
  idade: z.number().int().min(0).max(130).nullable().default(null),
  epitafio: z.string().trim().max(200).nullable().default(null),
  historia: z.string().trim().max(8000).nullable().default(null),
  autorizadoPor: z.string().trim().max(160).nullable().default(null),
  moderarMensagens: z.boolean().default(false),
  eventos: z.array(eventoInputSchema).max(6).default([]),
  fotos: z.array(fotoInputSchema).max(12).default([]),
})

export type MemorialInput = z.infer<typeof memorialInputSchema>
