/* Frases de identidade das páginas legais, montadas a partir do inquilino.
 *
 * POR QUE ISTO EXISTE (20/08/2026): /privacidade e /termos são servidas em todo
 * domínio do produto e traziam "Carvalho & Borak Ltda (Funerária São
 * Francisco), CNPJ 79.036.497/0001-58" escrito no código. A política de
 * privacidade da segunda funerária declararia como controladora dos dados uma
 * empresa que não é ela.
 *
 * A regra que governa este arquivo: **nunca imprimir lacuna e nunca inventar
 * dado**. Um documento jurídico com "[CNPJ]" no meio é pior do que um documento
 * que simplesmente não menciona o CNPJ; e um CNPJ inventado é pior que os dois.
 * Por isso cada função monta a frase a partir das partes que existem e devolve
 * uma frase completa — ou omite a cláusula inteira, quando não há como dizê-la
 * com verdade (é o caso do foro).
 */
import type { Funeraria } from '../memorial/types'

/** Junta pedaços de frase, ignorando os que faltam. */
function frase(...partes: (string | null | undefined | false)[]): string {
  return partes.filter(Boolean).join('')
}

/** Como a casa é chamada quando não sabemos mais nada sobre ela. */
export function nomeDe(f: Funeraria | null): string {
  return f?.nome ?? 'a funerária responsável por este site'
}

/**
 * Quem responde pelo site. Sai em uma de quatro formas, conforme o que a
 * funerária preencheu:
 *   "Carvalho & Borak Ltda (Funerária São Francisco), inscrita no CNPJ sob
 *    nº 79.036.497/0001-58"
 *   "Funerária São Francisco, inscrita no CNPJ sob nº …"
 *   "Carvalho & Borak Ltda (Funerária Modelo)"
 *   "a funerária responsável por este site"
 */
export function controlador(f: Funeraria | null): string {
  if (!f) return nomeDe(null)
  const quem = f.razaoSocial ? `${f.razaoSocial} (${f.nome})` : f.nome
  /* O endereço NÃO entra aqui, e não é descuido: ele é texto livre que começa
     ora com "Avenida", ora com "Rua", ora com "Praça" — nenhuma preposição
     serve para todos ("com sede em Avenida" está errado, "na Rua" idem quando
     vier "Sítio"). Sai em frase própria, com dois-pontos. Ver `enderecoSede`. */
  return frase(quem, f.cnpj && `, inscrita no CNPJ sob nº ${f.cnpj}`)
}

/** O endereço da sede como frase independente, para fugir do problema de
 *  concordância acima. Null quando a funerária não declarou endereço. */
export function enderecoSede(f: Funeraria | null): string | null {
  return f?.endereco ?? null
}

/** Versão curta, para a abertura dos Termos (sem endereço). */
export function mantenedor(f: Funeraria | null): string {
  if (!f) return nomeDe(null)
  const quem = f.razaoSocial ? `${f.razaoSocial} (${f.nome})` : f.nome
  return frase(quem, f.cnpj && `, CNPJ ${f.cnpj}`)
}

/**
 * Para onde escrever. Preferimos o Encarregado; na falta dele o e-mail público;
 * na falta dos dois, o WhatsApp — que toda funerária tem, porque é o que o
 * produto exige para funcionar. A frase muda junto com o canal, para não
 * prometer "escreva para" quando o canal é uma conversa.
 */
export function canalDeContato(f: Funeraria | null): {
  /** Já vem com a preposição contraída — "pelo e-mail ", "pelos canais…". Sem
   *  isso a frase saía "fale com o Encarregado (DPO) por os canais". */
  prefixo: string
  /** A parte clicável, quando existe. Null quando o canal é uma descrição. */
  texto: string | null
  href: string | null
} {
  const email = f?.dpoEmail ?? f?.email ?? null
  if (email) {
    return { prefixo: 'pelo e-mail ', texto: email, href: `mailto:${email}` }
  }
  if (f?.whatsapp) {
    return {
      prefixo: 'pelo ',
      texto: 'WhatsApp da funerária',
      href: `https://wa.me/${f.whatsapp}`,
    }
  }
  return {
    prefixo: 'pelos canais de atendimento da funerária',
    texto: null,
    href: null,
  }
}

/** Cláusula de foro: só existe se a comarca foi declarada. Foro não se deduz
 *  da cidade da funerária — a comarca pode ser outra, e errar a comarca num
 *  documento é pior do que não eleger foro (aí vale a regra geral da lei). */
export function foro(f: Funeraria | null): string | null {
  return f?.foroComarca ?? null
}

/** Bloco "Empresa" do rodapé: CNPJ, alvará e razão social, nesta ordem, só o
 *  que existir. Devolve null quando não há nada — aí a coluna some. */
export function blocoEmpresa(f: Funeraria | null): string | null {
  if (!f) return null
  const linhas = [f.cnpj && `CNPJ ${f.cnpj}`, f.alvara, f.razaoSocial].filter(
    Boolean,
  ) as string[]
  if (linhas.length) return linhas.join('\n')
  /* Inquilino antigo que ainda tem o texto livre da migration 0015. */
  return f.siteLegal
}
