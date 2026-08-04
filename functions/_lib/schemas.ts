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
  whatsappTexto: z.string().trim().max(1000).nullable().default(null),
  eventos: z.array(eventoInputSchema).max(6).default([]),
  fotos: z.array(fotoInputSchema).max(12).default([]),
})

export type MemorialInput = z.infer<typeof memorialInputSchema>

export const configInputSchema = z.object({
  nome: z.string().trim().min(1, 'Informe o nome.').max(120),
  cidade: z.string().trim().min(1, 'Informe a cidade.').max(80),
  uf: z.string().trim().length(2, 'UF com 2 letras.'),
  telefone: z.string().trim().min(1, 'Informe o telefone.').max(40),
  whatsapp: z.string().trim().min(8, 'WhatsApp com DDI+DDD (ex.: 5545...).').max(20),
  endereco: z.string().trim().max(200).nullable().default(null),
  desde: z.string().trim().max(10).nullable().default(null),
  sobre: z.string().trim().max(2000).nullable().default(null),
  velorioLocalPadrao: z.string().trim().max(160).nullable().default(null),
  velorioEnderecoPadrao: z.string().trim().max(200).nullable().default(null),
  sepultamentoLocalPadrao: z.string().trim().max(160).nullable().default(null),
  whatsappTemplate: z.string().trim().max(1000).nullable().default(null),
})

export const usuarioNovoSchema = z.object({
  nome: z.string().trim().min(2, 'Informe o nome.').max(120),
  email: z.string().trim().toLowerCase().email('E-mail inválido.').max(160),
  papel: z.enum(['admin', 'editor']).default('admin'),
})

export const usuarioEditarSchema = z.object({
  nome: z.string().trim().min(2, 'Informe o nome.').max(120).optional(),
  papel: z.enum(['admin', 'editor']).optional(),
  ativo: z.boolean().optional(),
  reenviarConvite: z.boolean().optional(),
})
