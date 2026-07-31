/* Formulário do dono (funerária) para abrir uma nova nota de falecimento.
 * Front-end apenas: valida com zod e mostra toast. Persistência/prévia entram com o backend. */
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { getMemorial } from './memorial-data'
import './memorial.css'

const schema = z
  .object({
    nomeCompleto: z.string().trim().min(1, 'Informe o nome completo.').max(120),
    apelido: z.string().trim().max(80).optional().default(''),
    nascimento: z.string().optional().default(''),
    cidadeNascimento: z.string().trim().max(80).optional().default(''),
    falecimento: z.string().min(1, 'Informe a data de falecimento.'),
    cidadeFalecimento: z.string().trim().max(80).optional().default(''),
    epitafio: z
      .string()
      .trim()
      .max(90, 'O epitáfio é uma frase curta (até 90 caracteres).')
      .optional()
      .default(''),
    historia: z.string().trim().max(4000).optional().default(''),
    velorioLocal: z
      .string()
      .trim()
      .min(1, 'Informe o local do velório.')
      .max(120),
    velorioEndereco: z.string().trim().max(160).optional().default(''),
    velorioInicio: z.string().optional().default(''),
    sepLocal: z.string().trim().max(120).optional().default(''),
    sepInicio: z.string().optional().default(''),
    autorizadoPor: z
      .string()
      .trim()
      .min(1, 'Registre quem autorizou a publicação.')
      .max(120),
    // Aprovação de mensagens é opcional (a maioria não terá desafetos).
    moderarMensagens: z.boolean().default(false),
    aprovadorNome: z.string().trim().max(120).optional().default(''),
    aprovadorWhatsapp: z.string().trim().max(20).optional().default(''),
  })
  .superRefine((d, ctx) => {
    // WhatsApp do responsável só é exigido quando a família decide moderar.
    if (
      d.moderarMensagens &&
      !/^[0-9()+\-\s]{8,}$/.test(d.aprovadorWhatsapp ?? '')
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['aprovadorWhatsapp'],
        message:
          'Para revisar mensagens, informe o WhatsApp de quem vai aprovar.',
      })
    }
  })

type NovoForm = z.input<typeof schema>

export default function NovoMemorial() {
  const f = getMemorial()!.funeraria

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<NovoForm>({
    resolver: zodResolver(schema),
    defaultValues: { falecimento: '', moderarMensagens: false },
  })

  const moderar = watch('moderarMensagens')

  const onSubmit = (data: NovoForm) => {
    // Sem backend ainda: em produção isto grava o rascunho e leva para a prévia.
    console.info('nova nota (rascunho)', data)
    toast.success('Rascunho pronto', {
      description:
        'No próximo passo você confere a página exata antes de publicar.',
    })
  }

  return (
    <div
      className="memorial-root"
      style={{ ['--marca' as string]: f.corMarca }}
    >
      <header className="topo">
        <div className="topo-in">
          <a className="wm" href="/">
            {f.nome}
            <small>Painel</small>
          </a>
          <span className="tel">
            <span>
              <em>Nova nota</em>
              <span className="num">
                {f.cidade} · {f.uf}
              </span>
            </span>
          </span>
        </div>
      </header>

      <div className="form">
        <p className="eti" style={{ color: 'var(--brass-e)' }}>
          Nova nota de falecimento
        </p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <label>
            <span className="rot">Nome completo</span>
            <input type="text" {...register('nomeCompleto')} />
            {errors.nomeCompleto && (
              <span className="erro">{errors.nomeCompleto.message}</span>
            )}
          </label>

          <label>
            <span className="rot">Como era conhecido</span>
            <input
              type="text"
              placeholder="opcional"
              {...register('apelido')}
            />
            <span className="dica">Aparece abaixo do nome. Ex.: Dona Nair</span>
          </label>

          <div className="par">
            <label>
              <span className="rot">Nascimento</span>
              <input type="date" {...register('nascimento')} />
            </label>
            <label>
              <span className="rot">Cidade de nascimento</span>
              <input
                type="text"
                placeholder="Ex.: Catanduvas · PR"
                {...register('cidadeNascimento')}
              />
            </label>
          </div>

          <div className="par">
            <label>
              <span className="rot">Falecimento</span>
              <input type="date" {...register('falecimento')} />
              {errors.falecimento && (
                <span className="erro">{errors.falecimento.message}</span>
              )}
            </label>
            <label>
              <span className="rot">Cidade de falecimento</span>
              <input
                type="text"
                placeholder="opcional"
                {...register('cidadeFalecimento')}
              />
            </label>
          </div>

          <label>
            <span className="rot">Epitáfio</span>
            <input
              type="text"
              placeholder="Uma frase que resume — opcional"
              {...register('epitafio')}
            />
            <span className="dica">
              Uma linha, no topo da página e no card de compartilhamento.
            </span>
            {errors.epitafio && (
              <span className="erro">{errors.epitafio.message}</span>
            )}
          </label>

          {/* Eventos */}
          <div className="grupo">
            <span className="eti">Onde e quando</span>
            <label>
              <span className="rot">Velório — local</span>
              <input type="text" {...register('velorioLocal')} />
              {errors.velorioLocal && (
                <span className="erro">{errors.velorioLocal.message}</span>
              )}
            </label>
            <label>
              <span className="rot">Velório — endereço</span>
              <input type="text" {...register('velorioEndereco')} />
            </label>
            <label>
              <span className="rot">Velório — início</span>
              <input type="datetime-local" {...register('velorioInicio')} />
            </label>
            <label>
              <span className="rot">Sepultamento — local</span>
              <input type="text" {...register('sepLocal')} />
            </label>
            <label>
              <span className="rot">Sepultamento — horário</span>
              <input type="datetime-local" {...register('sepInicio')} />
              <span className="dica">
                Em branco = publicamos “a confirmar”.
              </span>
            </label>
          </div>

          {/* História opcional */}
          <div className="grupo">
            <span className="eti">A história (opcional)</span>
            <p className="dica">
              Só publicamos se a família enviar o texto. Cole aqui o que a
              família mandou — se não houver, a seção não aparece na página.
            </p>
            <label>
              <textarea
                placeholder="Texto biográfico enviado pela família"
                {...register('historia')}
              />
            </label>
          </div>

          {/* Autorização */}
          <div className="grupo">
            <span className="eti">Autorização da família</span>
            <p className="dica">
              Quem autoriza a publicação do nome, da foto e das homenagens.
            </p>

            <label>
              <span className="rot">Autorizado por (nome)</span>
              <input
                type="text"
                placeholder="Ex.: Maria de Souza (filha)"
                {...register('autorizadoPor')}
              />
              <span className="dica">
                Aparece no rodapé: “Publicação autorizada por…”.
              </span>
              {errors.autorizadoPor && (
                <span className="erro">{errors.autorizadoPor.message}</span>
              )}
            </label>
          </div>

          {/* Moderação de mensagens — opcional */}
          <div className="grupo">
            <span className="eti">Mensagens de homenagem</span>
            <p className="dica">
              Por padrão, as mensagens aparecem na hora. A maioria das famílias
              não precisa revisar. Ligue abaixo só se a família preferir aprovar
              cada mensagem antes de publicar.
            </p>

            <label className="velacheck">
              <input type="checkbox" {...register('moderarMensagens')} />
              <span>
                <span className="tt">
                  Revisar as mensagens antes de publicar
                </span>
                <span className="ds">
                  Cada mensagem fica em espera até a família aprovar. As velas
                  continuam entrando na hora, sem aprovação.
                </span>
              </span>
            </label>

            {moderar && (
              <>
                <div className="par">
                  <label>
                    <span className="rot">Responsável pelas aprovações</span>
                    <input
                      type="text"
                      placeholder="Nome do familiar"
                      {...register('aprovadorNome')}
                    />
                  </label>
                  <label className="zap">
                    <span className="rot">WhatsApp do responsável</span>
                    <input
                      type="tel"
                      inputMode="tel"
                      placeholder="(45) 90000-0000"
                      {...register('aprovadorWhatsapp')}
                    />
                    {errors.aprovadorWhatsapp && (
                      <span className="erro">
                        {errors.aprovadorWhatsapp.message}
                      </span>
                    )}
                  </label>
                </div>
                <p className="dica">
                  É neste WhatsApp que chega o link para{' '}
                  <b>aprovar ou recusar</b> cada mensagem, em um toque.
                </p>
              </>
            )}
          </div>

          <div className="aviso">
            <b>Antes de publicar você vê a página exata.</b> A conferência do
            nome e dos horários é sua — e a autorização da família precisa estar
            registrada acima.
          </div>
          <button className="acao" type="submit" disabled={isSubmitting}>
            Continuar para a prévia
          </button>
        </form>
      </div>
    </div>
  )
}
