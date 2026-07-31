/* Página pública do memorial. Front-end apenas: estado local + mock, sem backend. */
import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { getMemorial } from './memorial-data'
import type { Mensagem, Vela } from './types'
import {
  anoBR,
  dataHoraBR,
  dataLongaBR,
  iniciais,
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

export default function MemorialPage() {
  const { slug } = useParams()
  const memorial = getMemorial(slug)

  const [mensagens, setMensagens] = useState<Mensagem[]>(
    memorial?.mensagens ?? [],
  )
  const [velas, setVelas] = useState<Vela[]>(memorial?.velas ?? [])
  const [historiaAberta, setHistoriaAberta] = useState(false)

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

  const aprovadas = useMemo(
    () => mensagens.filter((m) => m.status === 'aprovada'),
    [mensagens],
  )

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

  const onSubmit = (data: HomenagemForm) => {
    if (data.website) return // honeypot: bot detectado, descarta em silêncio
    const agora = new Date().toISOString()
    const nome = data.nome.trim()
    const texto = (data.texto ?? '').trim()

    if (data.vela) {
      setVelas((prev) => [
        {
          id: `v-${Date.now()}`,
          nome,
          texto: texto || null,
          criadoEmISO: agora,
        },
        ...prev,
      ])
    }
    // Aprovação é opcional: quando a família não modera, a mensagem entra na hora.
    const moderar = memorial.moderarMensagens
    if (texto) {
      setMensagens((prev) => [
        {
          id: `m-${Date.now()}`,
          nome,
          texto,
          criadoEmISO: agora,
          status: moderar ? 'pendente' : 'aprovada',
        },
        ...prev,
      ])
    }

    if (texto && data.vela) {
      toast.success('Vela acesa e mensagem publicada', {
        description: moderar
          ? 'A vela já aparece; a mensagem entra assim que a família confirmar.'
          : 'Sua vela e sua mensagem já estão na página.',
      })
    } else if (texto) {
      toast.success(moderar ? 'Mensagem enviada' : 'Mensagem publicada', {
        description: moderar
          ? 'Ela aparece assim que a família confirmar — costuma levar poucos minutos.'
          : 'Sua mensagem já aparece na página.',
      })
    } else {
      toast.success('Vela acesa', {
        description: 'Obrigado por deixar sua luz.',
      })
    }
    reset({ nome: '', texto: '', vela: true, website: '' })
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
            {memorial.fotoUrl ? (
              <img src={memorial.fotoUrl} alt={memorial.nomeCompleto} />
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

      <div className="corpo">
        {/* contador */}
        <div className="contador">
          <div>
            <b className="num">{velas.length}</b>
            <span>Velas acesas</span>
          </div>
          <div>
            <b className="num">{aprovadas.length}</b>
            <span>Mensagens</span>
          </div>
          <div>
            <b className="num">{memorial.visitas.toLocaleString('pt-BR')}</b>
            <span>Visitas</span>
          </div>
        </div>

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

        {/* onde e quando */}
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
        </section>

        {/* comunidade — exibição em duas colunas */}
        <section className="sec">
          <h2 className="eti">Quem ama, lembra · Comunidade</h2>
          <div className="com">
            <div className="col">
              <h3>
                Mensagens recentes{' '}
                {aprovadas.length > 3 && <a href="#homenagear">ver todas</a>}
              </h3>
              {aprovadas.length === 0 && (
                <p className="vazio">
                  Ainda não há mensagens. Seja o primeiro a deixar uma palavra.
                </p>
              )}
              {aprovadas.slice(0, 6).map((m) => (
                <div className="item" key={m.id}>
                  <div className="av">{iniciais(m.nome) || '·'}</div>
                  <div>
                    <span className="quem">{m.nome}</span>
                    <span className="qd">{tempoRelativo(m.criadoEmISO)}</span>
                    <p className="tx">{m.texto}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="col">
              <h3>
                Velas acesas{' '}
                {velas.length > 3 && <a href="#homenagear">ver todas</a>}
              </h3>
              {velas.length === 0 && (
                <p className="vazio">Acenda a primeira vela em memória.</p>
              )}
              {velas.slice(0, 6).map((v) => (
                <div className="item vela" key={v.id}>
                  <div className="av">🕯️</div>
                  <div>
                    <span className="quem">{v.nome}</span>
                    <span className="qd">{tempoRelativo(v.criadoEmISO)}</span>
                    {v.texto && <p className="tx">{v.texto}</p>}
                  </div>
                </div>
              ))}
            </div>
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
              className="acao metal"
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
    </div>
  )
}
