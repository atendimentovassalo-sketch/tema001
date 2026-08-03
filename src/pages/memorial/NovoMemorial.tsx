/* Formulário do dono (funerária) para abrir uma nova nota de falecimento.
 * Front-end apenas: valida com zod e mostra toast. Persistência/prévia entram com o backend. */
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { ApiError } from '@/lib/api'
import {
  fetchConfig,
  fetchMemorialAdmin,
  criarMemorial,
  atualizarMemorialApi,
  publicarMemorialApi,
  uploadFoto,
  type DadosMemorialInput,
  type ConfigTenant,
} from './api'
import { TEMPLATE_WHATSAPP_PADRAO } from './share'
import { useSessao } from '../admin/auth'
import { idadeEm, iniciais } from './format'
import { recortar45 } from './image'
import './memorial.css'

/** Converte data URL (JPEG do recorte) em Blob SEM fetch — a CSP
 * (connect-src 'self') bloqueia fetch de data: URL. Decodifica o base64. */
function dataUrlParaBlob(dataUrl: string): Blob {
  const virgula = dataUrl.indexOf(',')
  const cabecalho = dataUrl.slice(0, virgula)
  const base64 = dataUrl.slice(virgula + 1)
  const mime = cabecalho.match(/data:([^;]+)/)?.[1] ?? 'image/jpeg'
  const bin = atob(base64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return new Blob([bytes], { type: mime })
}

/** Recorta a hora "datetime-local" (sem timezone) mantendo o valor local. */
function isoLocal(v: string): string | null {
  return v ? v : null
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
    whatsappTexto: z.string().trim().max(1000).optional().default(''),
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
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const editId = params.get('id')
  const { carregando: authCarregando, usuario } = useSessao()

  const [cfg, setCfg] = useState<ConfigTenant | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<NovoForm>({
    resolver: zodResolver(schema),
    defaultValues: { falecimento: '', moderarMensagens: false },
  })

  const moderar = watch('moderarMensagens')
  const nomeAtual = watch('nomeCompleto')

  const [foto, setFoto] = useState<string | null>(null)
  const [fotoProcessando, setFotoProcessando] = useState(false)
  const [publicando, setPublicando] = useState(false)

  // guarda de sessão: só admin logado
  useEffect(() => {
    if (!authCarregando && !usuario) navigate('/admin/login', { replace: true })
  }, [authCarregando, usuario, navigate])

  // config da funerária (cabeçalho + padrões + modelo). Em nota NOVA,
  // pré-preenche os locais padrão (editáveis).
  useEffect(() => {
    fetchConfig()
      .then((c) => {
        setCfg(c)
        if (!editId) {
          if (c.velorioLocalPadrao) setValue('velorioLocal', c.velorioLocalPadrao)
          if (c.velorioEnderecoPadrao)
            setValue('velorioEndereco', c.velorioEnderecoPadrao)
          if (c.sepultamentoLocalPadrao)
            setValue('sepLocal', c.sepultamentoLocalPadrao)
        }
      })
      .catch(() => {})
  }, [editId, setValue])

  // modo edição: carrega e preenche
  useEffect(() => {
    if (!editId) return
    let vivo = true
    fetchMemorialAdmin(editId).then((m) => {
      if (!vivo) return
      if (!m) {
        toast.error('Memorial não encontrado.')
        navigate('/admin', { replace: true })
        return
      }
      const vel = m.eventos.find((e) => e.tipo === 'velorio')
      const sep = m.eventos.find((e) => e.tipo === 'sepultamento')
      reset({
        nomeCompleto: m.nomeCompleto,
        apelido: m.apelido ?? '',
        nascimento: m.nascimentoISO ?? '',
        cidadeNascimento: m.cidadeNascimento ?? '',
        falecimento: m.falecimentoISO,
        cidadeFalecimento: m.cidadeFalecimento ?? '',
        epitafio: m.epitafio ?? '',
        historia: m.historia ?? '',
        whatsappTexto: m.whatsappTexto ?? '',
        velorioLocal: vel?.localNome ?? '',
        velorioEndereco: vel?.endereco ?? '',
        velorioInicio: vel?.inicioISO?.slice(0, 16) ?? '',
        sepLocal: sep?.localNome ?? '',
        sepInicio: sep?.inicioISO?.slice(0, 16) ?? '',
        autorizadoPor: m.autorizadoPor ?? '',
        moderarMensagens: m.moderarMensagens,
      })
      setFoto(m.fotoUrl)
    })
    return () => {
      vivo = false
    }
  }, [editId, reset, navigate])

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

  async function montarDados(data: NovoForm): Promise<DadosMemorialInput> {
    // sobe a foto se for nova (data URL do recorte); mantém URL já existente
    let fotoUrl: string | null = foto
    if (foto && foto.startsWith('data:')) {
      const blob = await dataUrlParaBlob(foto)
      fotoUrl = await uploadFoto(blob)
    }
    const eventos: DadosMemorialInput['eventos'] = []
    if (data.velorioLocal) {
      eventos.push({
        tipo: 'velorio',
        localNome: data.velorioLocal,
        endereco: data.velorioEndereco || null,
        inicioISO: isoLocal(data.velorioInicio || ''),
        horarioConfirmado: Boolean(data.velorioInicio),
      })
    }
    if (data.sepLocal) {
      eventos.push({
        tipo: 'sepultamento',
        localNome: data.sepLocal,
        endereco: null,
        inicioISO: isoLocal(data.sepInicio || ''),
        horarioConfirmado: Boolean(data.sepInicio),
      })
    }
    return {
      nomeCompleto: data.nomeCompleto,
      apelido: data.apelido || null,
      fotoUrl,
      nascimentoISO: data.nascimento || null,
      cidadeNascimento: data.cidadeNascimento || null,
      falecimentoISO: data.falecimento,
      cidadeFalecimento: data.cidadeFalecimento || null,
      idade: idadeEm(data.nascimento || null, data.falecimento),
      epitafio: data.epitafio || null,
      historia: data.historia || null,
      autorizadoPor: data.autorizadoPor || null,
      moderarMensagens: data.moderarMensagens ?? false,
      whatsappTexto: data.whatsappTexto?.trim() || null,
      eventos,
      fotos: [],
    }
  }

  async function salvar(data: NovoForm, publicar: boolean) {
    if (publicar) setPublicando(true)
    try {
      const dados = await montarDados(data)
      let id: string | null = editId
      if (editId) {
        await atualizarMemorialApi(editId, dados)
      } else {
        const r = await criarMemorial(dados)
        id = r.id
      }
      if (publicar && id) await publicarMemorialApi(id, true)
      toast.success(publicar ? 'Memorial publicado' : 'Rascunho salvo')
      navigate('/admin')
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : 'Não foi possível salvar agora.',
      )
      setPublicando(false)
    }
  }

  const onSubmit = (data: NovoForm) => salvar(data, false)

  if (!cfg) {
    return <div className="memorial-root" style={{ minHeight: '100vh' }} />
  }

  return (
    <div className="memorial-root">
      <header className="topo">
        <div className="topo-in">
          <a className="wm" href="/admin">
            {cfg.nome}
            <small>Painel</small>
          </a>
          <span className="tel">
            <span>
              <em>{editId ? 'Editar nota' : 'Nova nota'}</em>
              <span className="num">
                {cfg.cidade} · {cfg.uf}
              </span>
            </span>
          </span>
        </div>
      </header>

      <div className="form">
        <p className="eti" style={{ color: 'var(--brass-e)' }}>
          {editId ? 'Editar nota de falecimento' : 'Nova nota de falecimento'}
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

          {/* Mensagem do WhatsApp (opcional, sobrescreve o modelo) */}
          <div className="grupo">
            <span className="eti">Mensagem do WhatsApp (opcional)</span>
            <p className="dica">
              Texto que acompanha o link ao compartilhar esta nota. Em branco =
              usa o modelo padrão da funerária (defina em Configurações).
            </p>
            <label>
              <textarea
                placeholder={cfg.whatsappTemplate || TEMPLATE_WHATSAPP_PADRAO}
                {...register('whatsappTexto')}
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
            <b>Salve como rascunho para conferir a página antes de publicar.</b>{' '}
            A conferência do nome e dos horários é sua — e a autorização da
            família precisa estar registrada acima.
          </div>
          <div className="duo">
            <button
              className="acao"
              type="submit"
              disabled={isSubmitting || publicando}
            >
              {isSubmitting && !publicando ? 'Salvando…' : 'Salvar rascunho'}
            </button>
            <button
              className="acao primaria"
              type="button"
              disabled={isSubmitting || publicando}
              onClick={handleSubmit((d) => salvar(d, true))}
            >
              {publicando ? 'Publicando…' : 'Salvar e publicar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
