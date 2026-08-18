/* Modelos de mensagem de WhatsApp para o cliente da funerária.
 *
 * Regra de tom, e não é preferência: quem recebe estas mensagens é vizinho de
 * quem escreve, numa cidade de sete mil habitantes. Cobrança agressiva não é só
 * feia — custa a próxima indicação, que é de onde vem quase todo atendimento
 * dela (questionário de 13/08: as famílias chegam por indicação, nunca pela
 * internet). Por isso todo texto abaixo é curto, trata o atraso como
 * possibilidade e não como acusação, e termina com uma saída fácil.
 *
 * Nada aqui é enviado pelo sistema: o texto vai pré-preenchido para o WhatsApp e
 * quem aperta enviar é a pessoa. É de propósito — mensagem sobre dinheiro e
 * sobre luto não sai de automação sem alguém ler antes.
 */
import { formatarReais, formatarData } from './dinheiro'

export interface DadosMensagem {
  clienteNome: string
  funeraria: string
  /** Total em aberto do cliente, em centavos. 0 quando não há nada. */
  emAbertoCentavos: number
  /** Vencimento mais próximo em aberto, 'AAAA-MM-DD'. */
  vencimento: string | null
  /** Link do memorial, quando a mensagem for sobre uma nota publicada. */
  memorialUrl?: string | null
}

export interface Modelo {
  id: string
  rotulo: string
  /** Texto pronto, ou null quando o modelo não se aplica ao cliente. */
  texto: (d: DadosMensagem) => string | null
}

/** Primeiro nome: "Maria das Graças Nascimento" -> "Maria". Mensagem que abre
 *  com o nome completo soa a cobrança de banco. */
function primeiroNome(nome: string): string {
  return nome.trim().split(/\s+/)[0] ?? nome
}

export const MODELOS: Modelo[] = [
  {
    id: 'lembrete',
    rotulo: 'Lembrete de vencimento',
    texto: (d) =>
      d.emAbertoCentavos > 0
        ? `Oi, ${primeiroNome(d.clienteNome)}! Tudo bem?\n\n` +
          `Passando só para lembrar que a mensalidade do plano ` +
          `${d.vencimento ? `vence dia ${formatarData(d.vencimento)}` : 'está próxima do vencimento'}` +
          `, no valor de ${formatarReais(d.emAbertoCentavos)}.\n\n` +
          `Se já tiver pago, pode desconsiderar. Qualquer coisa é só me chamar.\n\n` +
          `— ${d.funeraria}`
        : null,
  },
  {
    id: 'cobranca',
    rotulo: 'Cobrança (em atraso)',
    texto: (d) =>
      d.emAbertoCentavos > 0
        ? `Oi, ${primeiroNome(d.clienteNome)}, tudo bem?\n\n` +
          `Consta aqui uma mensalidade em aberto de ${formatarReais(d.emAbertoCentavos)}` +
          `${d.vencimento ? `, com vencimento em ${formatarData(d.vencimento)}` : ''}.\n\n` +
          `Pode ser que já tenha sido paga e não tenha chegado no meu controle — ` +
          `se for o caso, me avisa que eu acerto aqui.\n\n` +
          `Se preferir combinar outra data, também dá. É só me falar.\n\n` +
          `— ${d.funeraria}`
        : null,
  },
  {
    id: 'fatura',
    rotulo: 'Resumo do que está em aberto',
    texto: (d) =>
      d.emAbertoCentavos > 0
        ? `Oi, ${primeiroNome(d.clienteNome)}! Segue o resumo do seu plano:\n\n` +
          `Em aberto: ${formatarReais(d.emAbertoCentavos)}\n` +
          `${d.vencimento ? `Vencimento: ${formatarData(d.vencimento)}\n` : ''}` +
          `\nQualquer dúvida sobre o plano, é só me chamar por aqui.\n\n` +
          `— ${d.funeraria}`
        : null,
  },
  {
    id: 'memorial',
    rotulo: 'Enviar link do memorial',
    texto: (d) =>
      d.memorialUrl
        ? `Oi, ${primeiroNome(d.clienteNome)}. Sinto muito pela sua perda.\n\n` +
          `Preparei a página de homenagem, para quem quiser deixar uma mensagem ` +
          `ou acender uma vela:\n${d.memorialUrl}\n\n` +
          `Pode compartilhar com a família e com quem mais quiser.\n\n` +
          `Se quiser mudar alguma coisa — uma data, uma foto, o texto — me avisa ` +
          `que eu ajusto.\n\n— ${d.funeraria}`
        : null,
  },
]

/** Modelos aplicáveis a este cliente agora. Um modelo que não se aplica não
 *  aparece cinza: some. Opção que existe mas não funciona é pior que ausência. */
export function modelosAplicaveis(
  d: DadosMensagem,
): { modelo: Modelo; texto: string }[] {
  const saida: { modelo: Modelo; texto: string }[] = []
  for (const m of MODELOS) {
    const t = m.texto(d)
    if (t) saida.push({ modelo: m, texto: t })
  }
  return saida
}
