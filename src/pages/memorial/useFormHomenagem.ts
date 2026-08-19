/* Estado e validação dos formulários de homenagem, sem biblioteca.
 *
 * POR QUE ESCRITO À MÃO (18/08/2026)
 * ---------------------------------
 * Isto usava `react-hook-form` + `zod`. As duas somam 24 KB comprimidos e eram
 * baixadas por TODO visitante da página do falecido — mas medido no banco, só
 * ~1 em cada 10 visitas termina em homenagem. Nove pessoas pagavam o download
 * para as duas servirem a uma.
 *
 * Poderia ter sido resolvido carregando o formulário sob demanda, mas isso
 * coloca um "carregando…" exatamente no momento em que alguém está escrevendo
 * para um morto. Escrever a validação à mão elimina o custo em vez de adiá-lo,
 * e o formulário continua aparecendo na hora.
 *
 * As bibliotecas continuam no editor da funerária, que é tela de quem já está
 * logado e já carrega sob demanda — lá elas se pagam.
 *
 * DOIS MODOS (18/08/2026, fim do dia)
 * -----------------------------------
 * Vela e mensagem voltaram a ser AÇÕES IRMÃS E INDEPENDENTES, como a v5 tinha
 * decidido. Antes, a vela era uma caixa de seleção dentro do formulário de
 * mensagem: quem só queria acender uma vela caía num formulário que pedia texto.
 * Cada ação agora tem o seu formulário, e este hook serve aos dois — o que muda
 * é o que é obrigatório:
 *
 *   'vela'      → nome. Só isso. O gesto não pode custar uma redação.
 *   'mensagem'  → nome e texto. Mensagem vazia não é mensagem.
 *
 * Em ambos: nome até 80, texto até 600, e o honeypot que só robô preenche.
 */
import { useCallback, useState } from 'react'

export type ModoHomenagem = 'vela' | 'mensagem'

export interface ValoresHomenagem {
  nome: string
  texto: string
  vela: boolean
  velaTipo: string
  /** honeypot — humano nunca preenche */
  website: string
}

export type ErrosHomenagem = Partial<Record<'nome' | 'texto', string>>

export function validarHomenagem(
  v: ValoresHomenagem,
  modo: ModoHomenagem,
): ErrosHomenagem {
  const erros: ErrosHomenagem = {}
  const nome = v.nome.trim()
  const texto = v.texto.trim()

  if (!nome) erros.nome = 'Diga como você quer assinar.'
  else if (nome.length > 80) erros.nome = 'Máximo de 80 caracteres.'

  if (modo === 'mensagem') {
    if (texto.length > 600) erros.texto = 'Máximo de 600 caracteres.'
    else if (!texto) erros.texto = 'Escreva a sua mensagem.'
  }

  return erros
}

const INICIAL: ValoresHomenagem = {
  nome: '',
  texto: '',
  vela: true,
  velaTipo: '',
  website: '',
}

export function useFormHomenagem(modo: ModoHomenagem, velaPadrao: string) {
  const [valores, setValores] = useState<ValoresHomenagem>({
    ...INICIAL,
    vela: modo === 'vela',
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
    setValores({ ...INICIAL, vela: modo === 'vela', velaTipo: velaPadrao })
    setErros({})
  }, [modo, velaPadrao])

  /** Devolve os valores quando válido, ou null — e nesse caso já pintou os erros. */
  const validar = useCallback((): ValoresHomenagem | null => {
    const e = validarHomenagem(valores, modo)
    setErros(e)
    return Object.keys(e).length === 0 ? valores : null
  }, [valores, modo])

  return { valores, erros, enviando, setEnviando, campo, limpar, validar }
}
