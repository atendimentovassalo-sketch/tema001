/* Página pública do memorial. Front-end apenas: estado local + mock, sem backend. */
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { fetchMemorial, enviarHomenagem } from './api'
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
import './memorial.css'

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

export default function MemorialPage({
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
    return <div className="memorial-root" style={{ minHeight: '100vh' }} />
  }

  if (!memorial) {
    return (
      <div className="memorial-root">
        <div className="form" style={{ paddingTop: 80 }}>
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
  const descCompartilhar = velorio
    ? `Velório ${velorio.horarioConfirmado && velorio.inicioISO ? dataHoraBR(velorio.inicioISO) : 'horário a confirmar'}, ${velorio.localNome}. ${f.nome}, ${f.cidade}/${f.uf}.`
    : `${f.nome} — ${f.cidade}/${f.uf}`
  const textoZap = encodeURIComponent(
    `${memorial.nomeCompleto}\n${descCompartilhar}\n${urlAbs}`,
  )

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
    <div
      className="memorial-root"
      style={{ ['--marca' as string]: f.corMarca }}
    >
      {/* topo */}
      <header className="topo">
        <div className="topo-in">
          <a className="wm" href="/">
            {f.nome}
            <small>
              {f.cidade} · {f.uf}
            </small>
          </a>
          <a className="tel" href={`tel:${f.telefone}`}>
            <span>
              <em>24 horas</em>
              <span className="num">{f.telefone}</span>
            </span>
          </a>
        </div>
      </header>

      {/* hero */}
      <section className="hero" style={{ paddingBottom: 66 }}>
        <p className="eti2">Em memória de</p>
        <div className="moldura">
          <div className="janela">
            {retratoDe(memorial) ? (
              <img src={retratoDe(memorial)!} alt={memorial.nomeCompleto} />
            ) : (
              <span className="mono">{iniciais(memorial.nomeCompleto)}</span>
            )}
          </div>
        </div>
        <h1>{memorial.nomeCompleto}</h1>
        {memorial.apelido && <p className="trato">{memorial.apelido}</p>}
        <p className="orn" aria-hidden="true">
          <i></i>
          <b></b>
          <i></i>
        </p>
        <p className="datas num">
          {anoBR(memorial.nascimentoISO)}
          {memorial.nascimentoISO ? ' — ' : ''}
          {anoBR(memorial.falecimentoISO)}
          {memorial.idade ? ` · ${memorial.idade} anos` : ''}
        </p>
        {memorial.epitafio && (
          <p className="epi">&ldquo;{memorial.epitafio}&rdquo;</p>
        )}
        <div className="cta">
          <a className="solid" href="#homenagear">
            Deixar uma homenagem
          </a>
        </div>
      </section>

      <div className="corpo corpo-mem">
        <div className="corpo-cols">
        {/* contador */}
        <div className="contador">
          <div>
            <b className="num">{totalVelas}</b>
            <span>Velas acesas</span>
          </div>
          <div>
            <b className="num">{totalMensagens}</b>
            <span>Mensagens</span>
          </div>
          <div>
            <b className="num">{memorial.visitas.toLocaleString('pt-BR')}</b>
            <span>Visitas</span>
          </div>
        </div>

        {/* rail lateral: informação operacional (o motivo da visita) fica
            sempre à vista — sticky no desktop, no topo do fluxo no mobile */}
        <aside className="corpo-side">
          <section className="sec">
            <h2 className="eti">Onde e quando</h2>
            <div className="placa">
              <div className="placa-in">
                {memorial.eventos.map((e) => (
                  <div className="fato" key={e.id}>
                    <h3>{ROT[e.tipo] ?? e.tipo}</h3>
                    <p className="onde">{e.localNome}</p>
                    {e.endereco && <p className="end">{e.endereco}</p>}
                    <p
                      className={`quando${e.horarioConfirmado && e.inicioISO ? '' : ' pend'}`}
                    >
                      {e.horarioConfirmado && e.inicioISO
                        ? dataHoraBR(e.inicioISO)
                        : 'Horário a confirmar'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            {velorio && (
              <a
                className="acao"
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  [velorio.localNome, velorio.endereco]
                    .filter(Boolean)
                    .join(', '),
                )}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Como chegar ao velório
              </a>
            )}
            <a className="acao vazia" href="#homenagear">
              Acender uma vela
            </a>
          </section>
        </aside>

        <div className="corpo-main">
        {/* nascimento / falecimento */}
        <section className="sec">
          <h2 className="eti">Nascimento e falecimento</h2>
          <div className="marcos">
            <div className="marco">
              <p className="rot">Nascimento</p>
              {memorial.cidadeNascimento && (
                <p className="loc">{memorial.cidadeNascimento}</p>
              )}
              <p className="dt">{dataLongaBR(memorial.nascimentoISO)}</p>
            </div>
            <div className="marco">
              <p className="rot">Falecimento</p>
              {memorial.cidadeFalecimento && (
                <p className="loc">{memorial.cidadeFalecimento}</p>
              )}
              <p className="dt">{dataLongaBR(memorial.falecimentoISO)}</p>
            </div>
          </div>
        </section>

        {/* história — condicional: só quando a família envia e a funerária insere */}
        {memorial.historia && (
          <section className="sec">
            <h2 className="eti">A história</h2>
            <div className={`bio${historiaAberta ? '' : ' corta'}`}>
              {memorial.historia.split('\n\n').map((par, i) => (
                <p key={i}>{par}</p>
              ))}
            </div>
            {!historiaAberta && (
              <button
                className="lermais"
                onClick={() => setHistoriaAberta(true)}
              >
                Continuar lendo ›
              </button>
            )}
          </section>
        )}

        {/* álbum — limitado a 5 fotos */}
        {memorial.fotos.length > 0 && (
          <section className="sec">
            <h2 className="eti">
              Álbum ·{' '}
              <span style={{ opacity: 0.6 }}>
                {memorial.fotos.length} fotos
              </span>
            </h2>
            <div className="galeria">
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
          </section>
        )}

        {/* comunidade — feed único de homenagens.
            Avatar = vela acesa quando a pessoa acendeu; senão, iniciais.
            Homenagem só-vela (sem mensagem) fica diferenciada. */}
        <section className="sec">
          <h2 className="eti">Quem ama, lembra · Comunidade</h2>
          <div className="feed">
            {visiveis.length === 0 && (
              <p className="vazio">
                Ainda não há homenagens. Seja o primeiro a deixar uma palavra ou
                acender uma vela.
              </p>
            )}
            {visiveis.slice(0, 12).map((h) => {
              const soVela = h.vela && !h.texto
              return (
                <div
                  className={`item${h.vela ? ' vela' : ''}${soVela ? ' so-vela' : ''}`}
                  key={h.id}
                >
                  <div className="av">
                    {h.vela ? '🕯️' : iniciais(h.nome) || '·'}
                  </div>
                  <div>
                    <span className="quem">{h.nome}</span>
                    <span className="qd">{tempoRelativo(h.criadoEmISO)}</span>
                    {h.texto ? (
                      <p className="tx">{h.texto}</p>
                    ) : (
                      <p className="tx acendeu">acendeu uma vela</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* formulário único: homenagem + checkbox de vela */}
        <section className="sec mural" id="homenagear">
          <h2 className="eti">Deixe uma homenagem</h2>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <label>
              <span className="rot">Seu nome</span>
              <input
                type="text"
                placeholder="Como você quer assinar"
                {...register('nome')}
              />
              {errors.nome && (
                <span className="erro">{errors.nome.message}</span>
              )}
            </label>
            <label>
              <span className="rot">Sua mensagem</span>
              <textarea
                placeholder="Uma lembrança, uma oração, uma palavra de conforto"
                {...register('texto')}
              />
              {errors.texto && (
                <span className="erro">{errors.texto.message}</span>
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
            <label className="velacheck">
              <input type="checkbox" {...register('vela')} />
              <span>
                <span className="tt">
                  🕯️ Acender uma vela em memória de{' '}
                  {memorial.apelido ?? memorial.nomeCompleto.split(' ')[0]}
                </span>
                <span className="ds">
                  A vela é gratuita e aparece na hora, junto da homenagem.
                </span>
              </span>
            </label>
            <button
              className="acao primaria"
              type="submit"
              style={{ marginTop: 20 }}
              disabled={isSubmitting}
            >
              Publicar homenagem
            </button>
            <p className="mod">
              {memorial.moderarMensagens
                ? 'A mensagem aparece assim que a família confirmar — costuma levar poucos minutos. A vela é registrada na hora.'
                : 'Sua homenagem aparece na hora. Contamos com o respeito de todos neste momento.'}
            </p>
          </form>
        </section>

        {/* compartilhar */}
        <section className="sec">
          <h2 className="eti">Compartilhar</h2>
          <div className="duo">
            <a
              className="acao vazia"
              href={`https://wa.me/?text=${textoZap}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Enviar pelo WhatsApp
            </a>
            <button className="acao vazia" type="button" onClick={copiarLink}>
              Copiar link
            </button>
          </div>
        </section>

        <p className="corrigir">
          Alguma informação está incorreta?
          <br />
          <a
            href={`https://wa.me/${f.whatsapp}?text=${encodeURIComponent('Correção na página de ' + memorial.nomeCompleto)}`}
          >
            Avise pelo WhatsApp
          </a>{' '}
          — corrigimos em minutos.
        </p>
        </div>
        </div>
      </div>

      {/* rodapé com linha de autorização */}
      <footer className="rodape">
        <p className="wm">
          {f.nome}
          <small>Atendimento 24 horas</small>
        </p>
        <p className="end">
          {f.endereco}
          <br />
          {f.cidade} · {f.uf}
        </p>
        <a className="fone num" href={`tel:${f.telefone}`}>
          <small>Ligue a qualquer hora</small>
          {f.telefone}
        </a>
        {memorial.autorizadoPor && (
          <p className="autoriz">
            Publicação autorizada pela família, por{' '}
            <b>{memorial.autorizadoPor}</b>.
          </p>
        )}
      </footer>

      {preview && (
        <div className="form" style={{ maxWidth: 640 }}>
          <div className="aviso">
            <b>Confira o nome, os textos e os horários.</b> Depois de publicar,
            o endereço da página não muda — mas o conteúdo continua editável.
          </div>
          <button
            className="acao"
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
            className="acao vazia"
            type="button"
            style={{ marginTop: 12 }}
            onClick={() => navigate('/memorial/novo')}
          >
            Corrigir
          </button>
        </div>
      )}

      {/* CTA fixo no mobile — o botão do herói some ao rolar e a homenagem
          fica a milhares de pixels; a barra mantém a ação sempre à mão */}
      {!preview && (
        <nav className="mobicta" aria-label="Ação rápida">
          <a className="mb-btn" href="#homenagear">
            Deixar uma homenagem
          </a>
        </nav>
      )}
    </div>
  )
}
