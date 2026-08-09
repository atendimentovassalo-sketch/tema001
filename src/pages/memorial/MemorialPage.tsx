/* Página pública do memorial. Front-end apenas: estado local + mock, sem backend. */
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { fetchMemorial, enviarHomenagem } from './api'
import { montarTextoWhatsapp } from './share'
import { ApiError } from '@/lib/api'
import type { Homenagem, Memorial } from './types'
import {
  anoBR,
  dataHoraBR,
  dataLongaBR,
  iniciais,
  retratoDe,
  tempoRelativo,
} from './format'
import { SiteShell } from '@/components/SiteChrome'
import './memorial.css'
import MemorialLegado from './MemorialLegado'

const ROT: Record<string, string> = {
  velorio: 'Velório',
  cerimonia: 'Cerimônia de despedida',
  sepultamento: 'Sepultamento',
}

const homenagemSchema = z
  .object({
    nome: z.string().trim().min(1, 'Diga como você quer assinar.').max(80),
    texto: z
      .string()
      .trim()
      .max(600, 'Máximo de 600 caracteres.')
      .optional()
      .default(''),
    vela: z.boolean().default(true),
    // honeypot anti-spam: humanos não preenchem
    website: z.string().max(0).optional().default(''),
  })
  .refine((d) => d.vela || d.texto.trim().length > 0, {
    message: 'Escreva uma mensagem ou marque a vela.',
    path: ['texto'],
  })

type HomenagemForm = z.input<typeof homenagemSchema>

/** Chama de vela em CSS puro, bruxuleando (respeita prefers-reduced-motion). */
function Chama({ grande = false }: { grande?: boolean }) {
  return (
    <span className={`chama${grande ? ' chama-g' : ''}`} aria-hidden="true">
      <i />
    </span>
  )
}

/** "ago" + "4" para o selinho de calendário de um evento (a mesma zona horária
 * usada pelo restante da formatação de datas do memorial). */
function partesCalendario(iso: string | null): { mes: string; dia: string } | null {
  if (!iso) return null
  const d = new Date(iso)
  if (isNaN(d.getTime())) return null
  const p = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: 'numeric',
    month: 'short',
  }).formatToParts(d)
  const g = (t: string) => p.find((x) => x.type === t)?.value ?? ''
  return { mes: g('month').replace('.', ''), dia: g('day') }
}

function MemorialModerno({
  memorialOverride,
  preview = false,
}: {
  /** Quando presente, renderiza este memorial em vez de buscar pela rota (usado na prévia). */
  memorialOverride?: Memorial
  /** Mostra a barra "Confirmar e publicar / Corrigir" no fim. */
  preview?: boolean
} = {}) {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [memorial, setMemorial] = useState<Memorial | null>(
    memorialOverride ?? null,
  )
  const [carregando, setCarregando] = useState(!memorialOverride)
  const [homenagens, setHomenagens] = useState<Homenagem[]>(
    memorialOverride?.homenagens ?? [],
  )
  const [historiaAberta, setHistoriaAberta] = useState(false)

  useEffect(() => {
    if (memorialOverride) {
      setMemorial(memorialOverride)
      setHomenagens(memorialOverride.homenagens)
      return
    }
    let vivo = true
    if (slug) {
      fetchMemorial(slug)
        .then((m) => {
          if (!vivo) return
          setMemorial(m)
          setHomenagens(m?.homenagens ?? [])
        })
        .finally(() => {
          if (vivo) setCarregando(false)
        })
    } else {
      setCarregando(false)
    }
    return () => {
      vivo = false
    }
  }, [slug, memorialOverride])

  useEffect(() => {
    if (memorial) {
      document.title = `Nota de falecimento — ${memorial.nomeCompleto} | ${memorial.funeraria.nome}`
    }
  }, [memorial])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<HomenagemForm>({
    resolver: zodResolver(homenagemSchema),
    defaultValues: { nome: '', texto: '', vela: true, website: '' },
  })

  // Feed visível: toda homenagem com vela, e mensagens já aprovadas.
  const visiveis = useMemo(
    () => homenagens.filter((h) => h.vela || h.status === 'aprovada'),
    [homenagens],
  )
  const totalVelas = useMemo(
    () => homenagens.filter((h) => h.vela).length,
    [homenagens],
  )
  const totalMensagens = useMemo(
    () => homenagens.filter((h) => h.texto && h.status === 'aprovada').length,
    [homenagens],
  )

  if (carregando) {
    return <div className="memorial-root mv3" style={{ minHeight: '100vh' }} />
  }

  if (!memorial) {
    return (
      <div className="memorial-root mv3">
        <div className="mv3-w" style={{ paddingTop: 80, paddingBottom: 80 }}>
          <h2 style={{ fontSize: '1.8rem' }}>Memorial não encontrado</h2>
          <p style={{ marginTop: 12 }}>
            O endereço pode estar incorreto ou a página foi removida.
          </p>
        </div>
      </div>
    )
  }

  const f = memorial.funeraria
  const velorio = memorial.eventos.find((e) => e.tipo === 'velorio')
  const urlAbs = typeof window !== 'undefined' ? window.location.href : ''
  // texto do WhatsApp: modelo da funerária (ou override da nota) com variáveis
  const textoZap = encodeURIComponent(montarTextoWhatsapp(memorial, f))
  const primeiroNome = memorial.apelido ?? memorial.nomeCompleto.split(' ')[0]

  const onSubmit = async (data: HomenagemForm) => {
    if (data.website) return // honeypot: bot detectado, descarta em silêncio
    const nome = data.nome.trim()
    const texto = (data.texto ?? '').trim()

    // Na prévia (memorial ainda não salvo) insere só localmente para visualizar.
    if (preview) {
      setHomenagens((prev) => [
        {
          id: `p-${Date.now()}`,
          nome,
          texto: texto || null,
          vela: data.vela,
          criadoEmISO: new Date().toISOString(),
          status: 'aprovada',
        },
        ...prev,
      ])
      toast.success('Prévia — na página publicada a homenagem é registrada de verdade.')
      reset({ nome: '', texto: '', vela: true, website: '' })
      return
    }

    try {
      const r = await enviarHomenagem({
        memorialSlug: memorial.slug,
        nome,
        texto: texto || undefined,
        vela: data.vela,
      })
      // vela sempre entra no feed; mensagem moderada fica oculta até aprovar
      setHomenagens((prev) => [r.homenagem, ...prev])

      if (r.moderada) {
        toast.success('Mensagem enviada', {
          description:
            'Aparece assim que a família confirmar — costuma levar poucos minutos.',
        })
      } else if (texto && data.vela) {
        toast.success('Vela acesa e mensagem publicada')
      } else if (texto) {
        toast.success('Mensagem publicada')
      } else {
        toast.success('Vela acesa', { description: 'Obrigado por deixar sua luz.' })
      }
      reset({ nome: '', texto: '', vela: true, website: '' })
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : 'Não foi possível enviar agora.',
      )
    }
  }

  const copiarLink = () => {
    navigator.clipboard?.writeText(urlAbs)
    toast.success('Link copiado')
  }

  return (
    <SiteShell>
    <div
      className="memorial-root mv3"
      style={{ ['--marca' as string]: f.corMarca }}
    >

      {/* herói: retrato, nome, datas, epitáfio e as 3 ações principais */}
      <section className="mv3-hero">
        <div className="mv3-w">
          <div className="mv3-portrait">
            {retratoDe(memorial) ? (
              <img src={retratoDe(memorial)!} alt={memorial.nomeCompleto} />
            ) : (
              <span className="mv3-stub" aria-hidden="true">
                {iniciais(memorial.nomeCompleto)}
              </span>
            )}
          </div>
          <h1>{memorial.nomeCompleto}</h1>
          {memorial.apelido && (
            <p className="mv3-apelido">&ldquo;{memorial.apelido}&rdquo;</p>
          )}
          <p className="mv3-datas num">
            <b>{anoBR(memorial.nascimentoISO)}</b>
            {memorial.nascimentoISO && (
              <span className="mv3-bar" aria-hidden="true" />
            )}
            <b>{anoBR(memorial.falecimentoISO)}</b>
            {memorial.idade != null && <span> · {memorial.idade} anos</span>}
          </p>
          {memorial.epitafio && (
            <p className="mv3-epitafio">&ldquo;{memorial.epitafio}&rdquo;</p>
          )}
          <div className="mv3-acoes">
            <a className="mv3-btn mv3-btn--ouro" href="#homenagear">
              Deixar uma homenagem
            </a>
            <a className="mv3-btn mv3-btn--sage" href="#velas">
              Acender uma vela
            </a>
            <a className="mv3-btn mv3-btn--linha" href="#compartilhar">
              Compartilhar
            </a>
          </div>

          {/* contador: velas · mensagens · visitas */}
          <div className="mv3-contador">
            <div className="mv3-cel-vela">
              <Chama grande />
              <b className="num">{totalVelas}</b>
              <span>{totalVelas === 1 ? 'vela acesa' : 'velas acesas'}</span>
            </div>
            <div>
              <b className="num">{totalMensagens}</b>
              <span>{totalMensagens === 1 ? 'mensagem' : 'mensagens'}</span>
            </div>
            <div>
              <b className="num">{memorial.visitas.toLocaleString('pt-BR')}</b>
              <span>{memorial.visitas === 1 ? 'visita' : 'visitas'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* onde e quando: velório, cerimônia, sepultamento */}
      <section id="eventos" className="mv3-sec">
        <div className="mv3-w">
          <span className="mv3-cap">Serviços</span>
          <h2 className="mv3-h2">Onde e quando</h2>
          <div className="mv3-eventos">
            {memorial.eventos.map((e) => {
              const cal =
                e.horarioConfirmado && e.inicioISO
                  ? partesCalendario(e.inicioISO)
                  : null
              return (
                <div className="mv3-ev" key={e.id}>
                  <div className="mv3-ev-cal" aria-hidden="true">
                    <span className="m">{cal?.mes ?? '·'}</span>
                    <span className="d">{cal?.dia ?? '?'}</span>
                  </div>
                  <div>
                    <h3>{ROT[e.tipo] ?? e.tipo}</h3>
                    <p
                      className={`mv3-ev-quando${e.horarioConfirmado && e.inicioISO ? '' : ' pend'}`}
                    >
                      {e.horarioConfirmado && e.inicioISO
                        ? dataHoraBR(e.inicioISO)
                        : 'Horário a confirmar'}
                    </p>
                    <p className="mv3-ev-onde">
                      {e.localNome}
                      {e.endereco ? ` · ${e.endereco}` : ''}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
          {velorio && (
            <a
              className="mv3-link-mapa"
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                [velorio.localNome, velorio.endereco].filter(Boolean).join(', '),
              )}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Como chegar ao velório ›
            </a>
          )}
        </div>
      </section>

      {/* nascimento / falecimento */}
      <section className="mv3-sec">
        <div className="mv3-w">
          <span className="mv3-cap">Registro</span>
          <h2 className="mv3-h2">Nascimento e falecimento</h2>
          <div className="mv3-marcos">
            <div className="mv3-marco">
              <p className="rot">Nascimento</p>
              {memorial.cidadeNascimento && (
                <p className="loc">{memorial.cidadeNascimento}</p>
              )}
              <p className="dt">{dataLongaBR(memorial.nascimentoISO)}</p>
            </div>
            <div className="mv3-marco">
              <p className="rot">Falecimento</p>
              {memorial.cidadeFalecimento && (
                <p className="loc">{memorial.cidadeFalecimento}</p>
              )}
              <p className="dt">{dataLongaBR(memorial.falecimentoISO)}</p>
            </div>
          </div>
        </div>
      </section>

      {/* história — condicional: só quando a família envia e a funerária insere */}
      {memorial.historia && (
        <section id="historia" className="mv3-sec">
          <div className="mv3-w">
            <span className="mv3-cap">Memórias</span>
            <h2 className="mv3-h2">A história de {primeiroNome}</h2>
            <div className={`mv3-historia${historiaAberta ? '' : ' corta'}`}>
              {memorial.historia.split('\n\n').map((par, i) => (
                <p key={i}>{par}</p>
              ))}
            </div>
            {!historiaAberta && (
              <button
                className="mv3-lermais"
                type="button"
                onClick={() => setHistoriaAberta(true)}
              >
                Continuar lendo ›
              </button>
            )}
          </div>
        </section>
      )}

      {/* álbum — limitado a 5 fotos */}
      {memorial.fotos.length > 0 && (
        <section className="mv3-sec">
          <div className="mv3-w">
            <span className="mv3-cap">Recordações</span>
            <h2 className="mv3-h2">
              Álbum{' '}
              <span style={{ opacity: 0.55, fontSize: '0.58em' }}>
                · {memorial.fotos.length} fotos
              </span>
            </h2>
            <div className="mv3-galeria">
              {memorial.fotos.slice(0, 5).map((foto) => (
                <figure key={foto.id}>
                  <img
                    src={foto.url}
                    alt={foto.alt ?? memorial.nomeCompleto}
                    loading="lazy"
                  />
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* livro de homenagens: composição (mensagem + vela) e o mural com o
          feed. Avatar = vela acesa quando a pessoa acendeu; senão, iniciais.
          Homenagem só-vela (sem mensagem) fica diferenciada. */}
      <section id="homenagear" className="mv3-sec mv3-livro">
        <div className="mv3-w">
          <span className="mv3-cap">Homenagens</span>
          <h2 className="mv3-h2">Deixe uma mensagem para a família</h2>
          {visiveis.length > 0 && (
            <p className="mv3-contagem">
              <b>{visiveis.length}</b>{' '}
              {visiveis.length === 1
                ? 'pessoa já deixou uma homenagem'
                : 'pessoas já deixaram uma homenagem'}
            </p>
          )}

          <form className="mv3-compor" onSubmit={handleSubmit(onSubmit)} noValidate>
            <p className="mv3-dica">
              Não sabe o que escrever? Basta uma frase de carinho — &ldquo;Meus
              sentimentos, {primeiroNome} vai fazer falta.&rdquo;
            </p>
            <label>
              <span className="sr">Sua mensagem</span>
              <textarea
                placeholder="Escreva aqui uma lembrança, uma oração ou uma palavra de conforto…"
                {...register('texto')}
              />
              {errors.texto && (
                <span className="mv3-erro">{errors.texto.message}</span>
              )}
            </label>
            <label>
              <span className="sr">Seu nome</span>
              <input
                type="text"
                placeholder="Como você quer assinar"
                {...register('nome')}
              />
              {errors.nome && (
                <span className="mv3-erro">{errors.nome.message}</span>
              )}
            </label>
            {/* honeypot invisível */}
            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              style={{
                position: 'absolute',
                left: '-9999px',
                width: 1,
                height: 1,
              }}
              {...register('website')}
            />

            <div id="velas" className="mv3-vela-rot">
              Acenda uma vela junto com sua mensagem{' '}
              <span style={{ opacity: 0.6, fontWeight: 400 }}>(gratuita)</span>
            </div>
            <label className="mv3-vela-toggle">
              <input type="checkbox" {...register('vela')} />
              <span>
                <span className="tt">
                  🕯️ Acender uma vela em memória de {primeiroNome}
                </span>
                <span className="ds">
                  A vela é gratuita e aparece na hora, junto da homenagem.
                </span>
              </span>
            </label>

            <p className="mv3-nota-priv">
              {memorial.moderarMensagens
                ? 'A mensagem aparece assim que a família confirmar — costuma levar poucos minutos. A vela é registrada na hora.'
                : 'Sua homenagem aparece na hora. Contamos com o respeito de todos neste momento.'}{' '}
              Ao enviar, você concorda com a exibição da sua homenagem nesta
              página, conforme a{' '}
              <Link to="/privacidade">Política de Privacidade</Link>.
            </p>

            <div className="mv3-enviar">
              <button
                className="mv3-btn mv3-btn--ouro"
                type="submit"
                disabled={isSubmitting}
              >
                Publicar homenagem
              </button>
            </div>
          </form>

          <div className="mv3-mural">
            {visiveis.length === 0 && (
              <p className="mv3-vazio">
                Ainda não há homenagens. Seja o primeiro a deixar uma palavra
                ou acender uma vela.
              </p>
            )}
            {visiveis.slice(0, 12).map((h) => {
              const soVela = h.vela && !h.texto
              return (
                <div
                  className={`mv3-msg${h.vela ? ' vela' : ''}${soVela ? ' so-vela' : ''}`}
                  key={h.id}
                >
                  <div className="mv3-av">
                    {h.vela ? <Chama /> : iniciais(h.nome) || '·'}
                  </div>
                  <div>
                    <span className="mv3-msg-quem">{h.nome}</span>
                    <span className="mv3-msg-quando">
                      {tempoRelativo(h.criadoEmISO)}
                    </span>
                    {h.texto ? (
                      <p className="mv3-msg-txt">{h.texto}</p>
                    ) : (
                      <p className="mv3-msg-txt acendeu">acendeu uma vela</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* compartilhar */}
      <section id="compartilhar" className="mv3-sec">
        <div className="mv3-w">
          <span className="mv3-cap">Compartilhar</span>
          <h2 className="mv3-h2">Espalhe a notícia</h2>
          <div className="mv3-duo">
            <a
              className="mv3-btn mv3-btn--sage"
              href={`https://wa.me/?text=${textoZap}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Enviar pelo WhatsApp
            </a>
            <button
              className="mv3-btn mv3-btn--linha"
              type="button"
              onClick={copiarLink}
            >
              Copiar link
            </button>
          </div>
        </div>
      </section>

      {/* autorização da publicação + correção */}
      <div className="mv3-w">
        <div className="mv3-autor">
          <div>
            {memorial.autorizadoPor && (
              <>
                Publicação autorizada por <b>{memorial.autorizadoPor}</b>.{' '}
              </>
            )}
            Alguma informação está incorreta?{' '}
            <a
              href={`https://wa.me/${f.whatsapp}?text=${encodeURIComponent('Correção na página de ' + memorial.nomeCompleto)}`}
            >
              Avise pelo WhatsApp
            </a>{' '}
            — corrigimos em minutos.
          </div>
        </div>
      </div>

      {preview && (
        <div className="mv3-preview">
          <div className="mv3-aviso">
            <b>Confira o nome, os textos e os horários.</b> Depois de publicar,
            o endereço da página não muda — mas o conteúdo continua editável.
          </div>
          <button
            className="mv3-btn mv3-btn--ouro"
            type="button"
            onClick={() =>
              toast.success('Pronto para publicar', {
                description:
                  'A publicação de verdade (com geração do card do WhatsApp) entra com o backend.',
              })
            }
          >
            Confirmar e publicar
          </button>
          <button
            className="mv3-btn mv3-btn--linha"
            type="button"
            onClick={() => navigate('/memorial/novo')}
          >
            Corrigir
          </button>
        </div>
      )}

      {/* CTA fixo no mobile — o botão do herói some ao rolar e a homenagem
          fica a milhares de pixels; a barra mantém a ação sempre à mão */}
      {!preview && (
        <nav className="mv3-mobicta" aria-label="Ação rápida">
          <a className="mv3-btn mv3-btn--ouro" href="#homenagear">
            Deixar uma homenagem
          </a>
        </nav>
      )}
    </div>
    </SiteShell>
  )
}


/* ------------------------------------------------------------------ *
 * Seletor de modelo: os memoriais ja publicados no visual antigo (lista
 * abaixo) continuam no MemorialLegado; todos os novos usam o modelo novo.
 * Nao ha campo de data de criacao na API, por isso a selecao e por slug.
 * Para migrar um antigo ao novo, basta remove-lo desta lista.
 * ------------------------------------------------------------------ */
const MEMORIAIS_LEGADO = new Set<string>([
  'amalia-teresa-justen',
  'marli-cordeiro-de-almeida',
])

export default function MemorialPage(
  props: { memorialOverride?: Memorial; preview?: boolean } = {},
) {
  const { slug } = useParams()
  if (!props.memorialOverride && slug && MEMORIAIS_LEGADO.has(slug)) {
    return <MemorialLegado {...props} />
  }
  return <MemorialModerno {...props} />
}
