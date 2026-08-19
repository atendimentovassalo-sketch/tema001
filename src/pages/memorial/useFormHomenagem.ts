/* Estado e validação do formulário de homenagem, sem biblioteca.
 *
 * POR QUE ESCRITO À MÃO (18/08/2026)
 * ---------------------------------
 * Isto usava `react-hook-form` + `zod`. As duas somam 24 KB comprimidos e eram
 * baixadas por TODO visitante da página do falecido — mas medido no banco, só
 * ~1 em cada 10 visitas termina em homenagem. Nove pessoas pagavam o download
 * para as duas servirem a uma. Escrever a validação à mão elimina o custo em
 * vez de adiá-lo com carregamento sob demanda, que poria um "carregando…"
 * exatamente no momento em que alguém está escrevendo para um morto.
 *
 * UM FORMULÁRIO SÓ — e por que voltou a ser um (18/08/2026, fim do dia)
 * --------------------------------------------------------------------
 * Chegou a ser dois, para atender a decisão da v5 ("vela e mensagem são ações
 * irmãs e independentes"). O Felipe reprovou na tela, com um argumento que a
 * decisão da v5 não tinha previsto: **quem quer acender a vela E deixar uma
 * mensagem passava a preencher o nome duas vezes**, em dois formulários, com
 * dois botões. E o público desta página é em boa parte idoso.
 *
 * O problema real que a v5 apontava continua resolvido — ninguém é obrigado a
 * escrever texto para acender uma vela — mas por outro caminho: **o texto é
 * opcional**. A vela vem marcada. Quem só quer acender a vela escreve o nome e
 * envia; quem quer escrever, escreve no mesmo lugar.
 *
 * REGRAS:
 *   - nome obrigatório, até 80 caracteres — é a assinatura da homenagem
 *   - texto opcional, até 600
 *   - precisa de mensagem OU vela — não dá para enviar vazio
 *   - honeypot: campo invisível que só robô preenche
 */
import { useCallback, useState } from 'react'

export interface ValoresHomenagem {
  nome: string
  texto: string
  vela: boolean
  velaTipo: string
  /** honeypot — humano nunca preenche */
  website: string
}

export type CampoComErro = 'nome' | 'texto'
export type ErrosHomenagem = Partial<Record<CampoComErro, string>>

export function validarHomenagem(v: ValoresHomenagem): ErrosHomenagem {
  const erros: ErrosHomenagem = {}
  const nome = v.nome.trim()
  const texto = v.texto.trim()

  if (!nome) erros.nome = 'Escreva o seu nome para assinar a homenagem.'
  else if (nome.length > 80) erros.nome = 'Máximo de 80 caracteres.'

  if (texto.length > 600) erros.texto = 'Máximo de 600 caracteres.'
  else if (!v.vela && !texto)
    erros.texto = 'Escreva uma mensagem ou marque a vela.'

  return erros
}

/** Primeiro campo com erro, na ordem em que aparecem na tela. É para lá que o
 *  foco vai quando o envio falha: mandar a pessoa para o problema é melhor que
 *  esperar que ela procure. */
export function primeiroCampoComErro(e: ErrosHomenagem): CampoComErro | null {
  if (e.nome) return 'nome'
  if (e.texto) return 'texto'
  return null
}

const INICIAL: ValoresHomenagem = {
  nome: '',
  texto: '',
  vela: true,
  velaTipo: '',
  website: '',
}

export function useFormHomenagem(velaPadrao: string) {
  const [valores, setValores] = useState<ValoresHomenagem>({
    ...INICIAL,
    velaTipo: velaPadrao,
  })
  const [erros, setErros] = useState<ErrosHomenagem>({})
  const [enviando, setEnviando] = useState(false)
  /** Aviso de que a homenagem NÃO foi publicada, e por quê. Fica separado dos
   *  erros de campo porque é outra pergunta: "o que aconteceu com o meu envio?"
   *  — e é a essa pergunta que quem apertou o botão quer resposta. */
  const [naoPublicou, setNaoPublicou] = useState<string | null>(null)

  const campo = useCallback(
    <K extends keyof ValoresHomenagem>(nome: K, valor: ValoresHomenagem[K]) => {
      setValores((v) => ({ ...v, [nome]: valor }))
      /* Limpa o erro do campo assim que a pessoa mexe nele: manter o aviso
       * vermelho enquanto ela corrige é castigar quem já entendeu. */
      setErros((e) =>
        e[nome as CampoComErro] ? { ...e, [nome]: undefined } : e,
      )
      setNaoPublicou(null)
    },
    [],
  )

  const limpar = useCallback(() => {
    setValores({ ...INICIAL, velaTipo: velaPadrao })
    setErros({})
    setNaoPublicou(null)
  }, [velaPadrao])

  /** Devolve os valores quando válido (e `campoComErro` nulo), ou o campo que
   *  impediu a publicação — e nesse caso já pintou os erros e escreveu o aviso.
   *
   *  Devolve o campo em vez de deixar quem chama ler o estado `erros`: dentro do
   *  mesmo evento aquele estado ainda é o do render anterior, e o foco acabava
   *  indo para o campo errado. */
  const validar = useCallback((): {
    valores: ValoresHomenagem | null
    campoComErro: CampoComErro | null
  } => {
    const e = validarHomenagem(valores)
    setErros(e)
    const campoComErro = primeiroCampoComErro(e)
    setNaoPublicou(
      campoComErro === 'nome'
        ? 'A sua homenagem não foi publicada porque falta o seu nome. Ele aparece assinando a homenagem na página.'
        : campoComErro
          ? 'A sua homenagem não foi publicada. Escreva uma mensagem ou marque a vela.'
          : null,
    )
    return {
      valores: campoComErro === null ? valores : null,
      campoComErro,
    }
  }, [valores])

  return {
    valores,
    erros,
    enviando,
    setEnviando,
    campo,
    limpar,
    validar,
    naoPublicou,
    setNaoPublicou,
  }
}
