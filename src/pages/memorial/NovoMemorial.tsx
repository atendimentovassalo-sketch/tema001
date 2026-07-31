/* Formulário do dono (funerária) para abrir uma nova nota de falecimento.
 * Front-end apenas: valida com zod e mostra toast. Persistência/prévia entram com o backend. */
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { getMemorial } from './memorial-data'
import { saveDraft } from './draft'
import { idadeEm, iniciais } from './format'
import { recortar45 } from './image'
import type { Evento, Memorial } from './types'
import './memorial.css'

function slugify(nome: string): string {
  return nome
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 72)
}

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
  const navigate = useNavigate()

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
  const nomeAtual = watch('nomeCompleto')

  const [foto, setFoto] = useState<string | null>(null)
  const [fotoProcessando, setFotoProcessando] = useState(false)

  const onFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Selecione um arquivo de imagem.')
      return
    }
    if (file.size > 25 * 1024 * 1024) {
      toast.error('Imagem muito grande', {
        description: 'Envie uma foto de até 25 MB.',
      })
      return
    }
    setFotoProcessando(true)
    try {
      setFoto(await recortar45(file))
    } catch {
      toast.error('Não foi possível processar a imagem', {
        description: 'Tente outra foto (JPG ou PNG).',
      })
    } finally {
      setFotoProcessando(false)
    }
  }

  const onSubmit = (data: NovoForm) => {
    const eventos: Evento[] = []
    if (data.velorioLocal) {
      eventos.push({
        id: 'ev-velorio',
        tipo: 'velorio',
        localNome: data.velorioLocal,
        endereco: data.velorioEndereco || null,
        inicioISO: data.velorioInicio || null,
        horarioConfirmado: Boolean(data.velorioInicio),
      })
    }
    if (data.sepLocal) {
      eventos.push({
        id: 'ev-sep',
        tipo: 'sepultamento',
        localNome: data.sepLocal,
        endereco: null,
        inicioISO: data.sepInicio || null,
        horarioConfirmado: Boolean(data.sepInicio),
      })
    }

    const draft: Memorial = {
      id: 'rascunho',
      slug: slugify(data.nomeCompleto) || 'rascunho',
      funeraria: f,
      nomeCompleto: data.nomeCompleto,
      apelido: data.apelido || null,
      fotoUrl: foto,
      nascimentoISO: data.nascimento || null,
      cidadeNascimento: data.cidadeNascimento || null,
      falecimentoISO: data.falecimento,
      cidadeFalecimento: data.cidadeFalecimento || null,
      idade: idadeEm(data.nascimento || null, data.falecimento),
      epitafio: data.epitafio || null,
      historia: data.historia || null,
      eventos,
      fotos: [],
      mensagens: [],
      velas: [],
      visitas: 0,
      autorizadoPor: data.autorizadoPor || null,
      moderarMensagens: data.moderarMensagens ?? false,
    }

    saveDraft(draft)
    navigate('/memorial/previa')
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

          {/* Foto — recorte 4:5 no navegador */}
          <label>
            <span className="rot">Foto</span>
            <div className="foto-campo">
              <div className="foto-previa">
                {foto ? (
                  <img src={foto} alt="Prévia da foto" />
                ) : (
                  <span className="mono">
                    {iniciais(nomeAtual || '') || '—'}
                  </span>
                )}
              </div>
              <div className="foto-acoes">
                <input
                  id="foto-input"
                  type="file"
                  accept="image/*"
                  onChange={onFoto}
                  style={{ display: 'none' }}
                />
                <label htmlFor="foto-input" className="foto-btn">
                  {fotoProcessando
                    ? 'Processando…'
                    : foto
                      ? 'Trocar foto'
                      : 'Escolher foto'}
                </label>
                {foto && (
                  <button
                    type="button"
                    className="foto-btn vazio"
                    onClick={() => setFoto(null)}
                  >
                    Remover
                  </button>
                )}
                <span className="dica">
                  Recortamos em 4:5 automaticamente. Sem foto, publicamos com as
                  iniciais.
                </span>
              </div>
            </div>
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
