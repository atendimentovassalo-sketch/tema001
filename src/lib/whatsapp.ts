/* Abrir conversa no WhatsApp a partir do cadastro do cliente.
 *
 * A funerária digita telefone como fala: "(45) 99128-4521", "45 99128 4521",
 * "045 9 9128-4521". Nada disso serve como está — o wa.me quer só dígitos, com
 * DDI. Normalizar aqui é o que evita "o botão não funciona pra metade dos
 * clientes", que é como esse tipo de recurso costuma morrer. */

/** Telefone brasileiro digitado de qualquer jeito -> dígitos com DDI 55.
 *  Devolve null quando não dá para confiar — melhor esconder o botão do que
 *  abrir uma conversa com o número errado. */
export function telefoneParaWhatsApp(bruto: string | null): string | null {
  if (!bruto) return null
  let d = bruto.replace(/\D/g, '')

  // Tira o 0 de operadora ("045...") e o 0 de DDD nacional.
  if (d.length > 11 && d.startsWith('0')) d = d.replace(/^0+/, '')

  // Já veio com DDI 55 e comprimento plausível (55 + DDD + 8 ou 9 dígitos).
  if (d.startsWith('55') && (d.length === 12 || d.length === 13)) return d

  // DDD + número, sem DDI.
  if (d.length === 10 || d.length === 11) return '55' + d

  return null
}

/** Link do WhatsApp. Sem texto, abre a conversa em branco. */
export function linkWhatsApp(
  telefone: string | null,
  texto?: string,
): string | null {
  const num = telefoneParaWhatsApp(telefone)
  if (!num) return null
  const base = `https://wa.me/${num}`
  return texto ? `${base}?text=${encodeURIComponent(texto)}` : base
}
