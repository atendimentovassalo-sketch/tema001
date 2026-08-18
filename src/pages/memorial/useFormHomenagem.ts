/* Estado e validação do formulário de homenagem, sem biblioteca.
 *
 * POR QUE ESCRITO À MÃO (18/08/2026)
 * ---------------------------------
 * Este formulário usava `react-hook-form` + `zod`. As duas somam 24 KB
 * comprimidos e eram baixadas por TODO visitante da página do falecido — mas
 * medido no banco, só ~1 em cada 10 visitas termina em homenagem. Nove pessoas
 * pagavam o download para as duas servirem a uma.
 *
 * Poderia ter sido resolvido carregando o formulário sob demanda, mas isso
 * coloca um "carregando…" exatamente no momento em que alguém está escrevendo
 * para um morto. Escrever a validação à mão elimina o custo em vez de adiá-lo,
 * e o formulário continua aparecendo na hora.
 *
 * As bibliotecas continuam no editor da funerária, que é tela de quem já está
 * logado e já carrega sob demanda — lá elas se pagam.
 *
 * REGRAS (as mesmas de antes, uma a uma):
 *   - nome obrigatório, até 80 caracteres
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

export type ErrosHomenagem = Partial<Record<'nome' | 'texto', string>>

export function validarHomenagem(v: ValoresHomenagem): ErrosHomenagem {
  const erros: ErrosHomenagem = {}
  const nome = v.nome.trim()
  const texto = v.texto.trim()

  if (!nome) erros.nome = 'Diga como você quer assinar.'
  else if (nome.length > 80) erros.nome = 'Máximo de 80 caracteres.'

  if (texto.length > 600) erros.texto = 'Máximo de 600 caracteres.'
  else if (!v.vela && !texto)
    erros.texto = 'Escreva uma mensagem ou marque a vela.'

  return erros
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

  const campo = useCallback(
    <K extends keyof ValoresHomenagem>(nome: K, valor: ValoresHomenagem[K]) => {
      setValores((v) => ({ ...v, [nome]: valor }))
      /* Limpa o erro do campo assim que a pessoa mexe nele: manter o aviso
       * vermelho enquanto ela corrige é castigar quem já entendeu. */
      setErros((e) =>
        e[nome as 'nome' | 'texto'] ? { ...e, [nome]: undefined } : e,
      )
    },
    [],
  )

  const limpar = useCallback(() => {
    setValores({ ...INICIAL, velaTipo: velaPadrao })
    setErros({})
  }, [velaPadrao])

  /** Devolve os valores quando válido, ou null — e nesse caso já pintou os erros. */
  const validar = useCallback((): ValoresHomenagem | null => {
    const e = validarHomenagem(valores)
    setErros(e)
    return Object.keys(e).length === 0 ? valores : null
  }, [valores])

  return { valores, erros, enviando, setEnviando, campo, limpar, validar }
}
