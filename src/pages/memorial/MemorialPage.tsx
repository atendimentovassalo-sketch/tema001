/* Página pública do memorial. Front-end apenas: estado local + mock, sem backend. */
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom'
import { toast } from 'sonner'
import { fetchMemorial, fetchMemorialAdmin, enviarHomenagem } from './api'
import { Vela, TIPOS_VELA, TIPO_VELA_PADRAO } from './velas'
import { useFormHomenagem } from './useFormHomenagem'
import { montarTextoWhatsapp } from './share'
import { ApiError } from '@/lib/api'
import type { Homenagem, Memorial } from './types'
import {
  anoBR,
  mesAnoCurtoBR,
  dataHoraBR,
  dataLongaBR,
  mesAnoBR,
  iniciais,
  retratoDe,
  tempoRelativo,
} from './format'
import { SiteShell } from '@/components/SiteChrome'
import './memorial.css'

const ROT: Record<string, string> = {
  velorio: 'Velório',
  cerimonia: 'Cerimônia de despedida',
  sepultamento: 'Sepultamento',
}

/* Validação e estado do formulário: `useFormHomenagem`, escrito à mão.
 * As regras são as mesmas de antes — ver aquele arquivo para o porquê de não
 * usar biblioteca nesta página. */

/** A barra fixa de "Deixar uma homenagem" só aparece quando ela serve para
 *  alguma coisa: com as ações do herói ainda na tela ela repete, a um dedo de
 *  distância, um botão idêntico que a pessoa está vendo — e come 71 px da
 *  primeira dobra do celular, cobrindo justamente "Acender uma vela" e
 *  "Compartilhar". Com o formulário na tela ela também sobra: a pessoa já
 *  chegou onde a barra levaria.
 *
 *  Observa o FORMULÁRIO, não a seção inteira: a seção inclui o mural, que
 *  sozinho tem uns 2.000 px — observá-la deixava a barra escondida em quase
 *  toda a página, e ela só reaparecia nos últimos 50 px de rolagem. Enquanto a
 *  pessoa lê o mural a barra serve; enquanto ela escreve, não. */
function useBarraFixa(
  heroi: React.RefObject<HTMLElement | null>,
  formularios: React.RefObject<HTMLElement | null>[],
  /** Os alvos só existem depois que o memorial chega; sem isto o efeito
   *  rodaria uma vez no esqueleto, não acharia nada e nunca mais rodaria. */
  pronto: boolean,
) {
  const [mostrar, setMostrar] = useState(false)

  useEffect(() => {
    const alvos = [heroi.current, ...formularios.map((f) => f.current)].filter(
      Boolean,
    ) as Element[]
    if (alvos.length === 0) return

    /* O callback só recebe quem MUDOU de estado, por isso o conjunto: sem ele,
     * o segundo alvo apagaria a resposta do primeiro. */
    const naTela = new Set<Element>()
    const obs = new IntersectionObserver((entradas) => {
      for (const e of entradas) {
        if (e.isIntersecting) naTela.add(e.target)
        else naTela.delete(e.target)
      }
      setMostrar(naTela.size === 0)
    })

    alvos.forEach((a) => obs.observe(a))
    return () => obs.disconnect()
    /* `formularios` é literal novo a cada render; a lista de dependências usa o
       tamanho, que é o que de fato muda. */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heroi, formularios.length, pronto])

  return mostrar
}

/** Chama de vela em CSS puro, bruxuleando (respeita prefers-reduced-motion).
 *  Fica no contador do herói: ali o que se conta é o número, e a vela animada
 *  de verdade tem lugar próprio, no convite para acender (ver mv3-vela-destaque). */
function Chama({ grande = false }: { grande?: boolean }) {
  return (
    <span className={`chama${grande ? ' chama-g' : ''}`} aria-hidden="true">
      <i />
    </span>
  )
}

/** "ago" + "4" para o selinho de calendário de um evento (a mesma zona horária
 * usada pelo restante da formatação de datas do memorial). */
function partesCalendario(
  iso: string | null,
): { mes: string; dia: string } | null {
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
  faixa,
  rodape,
}: {
  /** Quando presente, renderiza este memorial em vez de buscar pela rota (usado na prévia). */
  memorialOverride?: Memorial
  /** Mostra a barra "Confirmar e publicar / Corrigir" no fim. */
  preview?: boolean
  /** Faixa de aviso no topo. A prévia da família traz a sua, com o caminho de
   *  volta para a edição; sem isto ela teria de recriar a página inteira só
   *  para pôr um aviso em cima. */
  faixa?: React.ReactNode
  /** Bloco no fim da página. A prévia da família põe aqui o "aprovar e
   *  publicar" — no fim de propósito: o pedido é ver primeiro, aprovar depois. */
  rodape?: React.ReactNode
} = {}) {
  const { slug } = useParams()
  /* `?previa=<id>` mostra a PÁGINA REAL de um memorial ainda em rascunho, para a
   * funerária conferir antes de publicar. Busca pelo endpoint ADMIN, que exige
   * sessão — a rota pública continua servindo só o que está publicado (o fix de
   * segurança de 13/08 permanece intacto). Sem sessão, a prévia simplesmente não
   * carrega, como qualquer rascunho. */
  const [params] = useSearchParams()
  const previaId = params.get('previa')
  const navigate = useNavigate()
  const [memorial, setMemorial] = useState<Memorial | null>(
    memorialOverride ?? null,
  )
  const [carregando, setCarregando] = useState(!memorialOverride)
  const [homenagens, setHomenagens] = useState<Homenagem[]>(
    memorialOverride?.homenagens ?? [],
  )
  const [historiaAberta, setHistoriaAberta] = useState(false)
  const acoesHeroiRef = useRef<HTMLDivElement>(null)
  const formularioRef = useRef<HTMLFormElement>(null)
  /* Para levar o foco ao campo que impediu a publicação. Dizer o que faltou sem
     levar a pessoa até lá deixa o trabalho de procurar para quem já errou. */
  const nomeRef = useRef<HTMLInputElement>(null)
  const textoRef = useRef<HTMLTextAreaElement>(null)
  const mostrarBarraFixa = useBarraFixa(
    acoesHeroiRef,
    [formularioRef],
    !carregando && memorial != null,
  )

  useEffect(() => {
    if (memorialOverride) {
      setMemorial(memorialOverride)
      setHomenagens(memorialOverride.homenagens)
      return
    }
    let vivo = true
    if (previaId) {
      fetchMemorialAdmin(previaId)
        .then((m) => {
          if (!vivo) return
          setMemorial(m)
          setHomenagens(m?.homenagens ?? [])
        })
        .finally(() => {
          if (vivo) setCarregando(false)
        })
    } else if (slug) {
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
  }, [slug, memorialOverride, previaId])

  useEffect(() => {
    if (memorial) {
      document.title = `Nota de falecimento — ${memorial.nomeCompleto} | ${memorial.funeraria.nome}`
    }
  }, [memorial])

  const {
    valores,
    erros,
    enviando,
    setEnviando,
    campo,
    limpar,
    validar,
    naoPublicou,
  } = useFormHomenagem(TIPO_VELA_PADRAO)

  /** A escolha do desenho só aparece com a vela marcada, e o cartão selecionado
   *  e o destaque grande precisam saber qual é. */
  const velaLigada = valores.vela
  const velaEscolhida = valores.velaTipo

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

  const faixaPrevia =
    faixa ??
    (previaId ? (
      <div className="mv3-previa-faixa" role="status">
        <strong>Pré-visualização</strong> — esta página ainda está como rascunho
        e não está no ar. Ninguém além de você a enxerga.
      </div>
    ) : null)

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

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    const { valores: data, campoComErro } = validar()
    if (!data) {
      /* Falhou: leva a pessoa ao campo. O aviso no topo do formulário diz o que
         aconteceu; o foco diz onde resolver. Sem os dois, quem não enxerga bem
         aperta o botão de novo achando que o site travou. */
      const alvo = campoComErro === 'texto' ? textoRef.current : nomeRef.current
      alvo?.focus()
      alvo?.scrollIntoView({ block: 'center', behavior: 'smooth' })
      return
    }
    if (data.website) return // honeypot: bot detectado, descarta em silêncio

    const nome = data.nome.trim()
    const texto = data.texto.trim()

    // Na prévia (memorial ainda não salvo) insere só localmente para visualizar.
    if (preview) {
      setHomenagens((prev) => [
        {
          id: `p-${Date.now()}`,
          nome,
          texto: texto || null,
          vela: data.vela,
          velaTipo: data.vela ? data.velaTipo : null,
          criadoEmISO: new Date().toISOString(),
          status: 'aprovada',
        },
        ...prev,
      ])
      toast.success(
        'Prévia — na página publicada a homenagem é registrada de verdade.',
      )
      limpar()
      return
    }

    setEnviando(true)
    try {
      const r = await enviarHomenagem({
        memorialSlug: memorial.slug,
        nome,
        texto: texto || undefined,
        vela: data.vela,
        velaTipo: data.vela ? data.velaTipo : null,
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
        toast.success('Vela acesa', {
          description: 'Obrigado por deixar sua luz.',
        })
      }
      limpar()
    } catch (err) {
      toast.error(
        err instanceof ApiError
          ? err.message
          : 'Não foi possível enviar agora.',
      )
    } finally {
      setEnviando(false)
    }
  }

  const copiarLink = () => {
    navigator.clipboard?.writeText(urlAbs)
    toast.success('Link copiado')
  }

  return (
    <SiteShell minimal>
      <div
        className="memorial-root mv3"
        style={{ ['--marca' as string]: f.corMarca }}
      >
        {faixaPrevia}

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
            {/* Mês e ano nos dois lados do intervalo (18/08/2026). Só o ano
                dizia pouco; o dia do NASCIMENTO continua fora, por ser vetor de
                fraude ao lado do nome completo (decisão de 12/08). */}
            <p className="mv3-datas num">
              <b>{mesAnoCurtoBR(memorial.nascimentoISO)}</b>
              {memorial.nascimentoISO && (
                <span className="mv3-bar" aria-hidden="true" />
              )}
              <b>{mesAnoCurtoBR(memorial.falecimentoISO)}</b>
              {memorial.idade != null && <span> · {memorial.idade} anos</span>}
            </p>
            {memorial.epitafio && (
              <p className="mv3-epitafio">&ldquo;{memorial.epitafio}&rdquo;</p>
            )}
            <div className="mv3-acoes" ref={acoesHeroiRef}>
              <a className="mv3-btn mv3-btn--ouro" href="#homenagear">
                Deixar uma homenagem
              </a>
              <a className="mv3-btn mv3-btn--sage" href="#vela">
                Acender uma vela
              </a>
              <a className="mv3-btn mv3-btn--linha" href="#compartilhar">
                Compartilhar
              </a>
            </div>

            {/* Contador: velas e mensagens. VISITAS SAIU DA PÁGINA PÚBLICA
                (decisão do Felipe, 18/08, restaurando a v5): número baixo de
                visitas transmite abandono à família, e visitas é métrica da
                funerária — continua contada e continua visível no painel dela.

                Os dois que ficaram viraram links para a ação correspondente: um
                número que convida a agir vale mais que um número que só informa. */}
            <div className="mv3-contador">
              <a className="mv3-cel-vela" href="#vela">
                {/* A chama fica NA LINHA do número, não acima: acima, ela
                    empurrava "6 / VELAS ACESAS" para baixo e os números do
                    contador não se alinhavam entre si. */}
                <b className="num">
                  <Chama />
                  {totalVelas}
                </b>
                <span>{totalVelas === 1 ? 'vela acesa' : 'velas acesas'}</span>
              </a>
              <a href="#homenagear">
                <b className="num">{totalMensagens}</b>
                <span>{totalMensagens === 1 ? 'mensagem' : 'mensagens'}</span>
              </a>
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
                  [velorio.localNome, velorio.endereco]
                    .filter(Boolean)
                    .join(', '),
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
                {/* Mês e ano, nunca o dia: ver mesAnoBR e a decisão de 12/08. */}
                <p className="dt">{mesAnoBR(memorial.nascimentoISO)}</p>
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
            <h2 className="mv3-h2">Deixe uma homenagem</h2>
            {visiveis.length > 0 && (
              <p className="mv3-contagem">
                <b>{visiveis.length}</b>{' '}
                {visiveis.length === 1
                  ? 'pessoa já deixou uma homenagem'
                  : 'pessoas já deixaram uma homenagem'}
              </p>
            )}

            {/* UM FORMULÁRIO, PENSADO PARA QUEM TEM 70 ANOS (18/08/2026).
                Chegou a ser dois (vela e mensagem separadas, como a v5 pedia) e
                o Felipe reprovou na tela: quem queria as duas coisas preenchia o
                nome duas vezes. O problema que a v5 apontava — ser obrigado a
                escrever para acender uma vela — segue resolvido, mas por outro
                caminho: o texto é opcional e a vela vem marcada.

                As decisões que atendem o público idoso desta página:
                RÓTULO VISÍVEL em cima de cada campo (o placeholder some quando a
                pessoa começa a digitar, e aí ninguém sabe mais o que era aquilo);
                o NOME VEM PRIMEIRO, porque é o único obrigatório; e quando o
                envio falha, o aviso diz que a homenagem NÃO foi publicada, por
                quê, e o foco vai para o campo. */}
            <form
              className="mv3-compor"
              onSubmit={onSubmit}
              noValidate
              ref={formularioRef}
            >
              {naoPublicou && (
                <p className="mv3-falhou" role="alert">
                  {naoPublicou}
                </p>
              )}

              <label className="mv3-rot" htmlFor="hom-nome">
                Seu nome
              </label>
              <input
                id="hom-nome"
                type="text"
                placeholder="Como você quer assinar"
                value={valores.nome}
                onChange={(e) => campo('nome', e.target.value)}
                maxLength={80}
                autoComplete="name"
                ref={nomeRef}
                aria-invalid={erros.nome ? true : undefined}
                aria-describedby={erros.nome ? 'hom-nome-erro' : undefined}
              />
              {erros.nome && (
                <span className="mv3-erro" id="hom-nome-erro">
                  {erros.nome}
                </span>
              )}

              <label className="mv3-rot" htmlFor="hom-texto">
                Sua mensagem{' '}
                <span className="mv3-op">(se quiser escrever)</span>
              </label>
              {/* Recado curto e ANTES do campo: quem chega aqui muitas vezes
                  trava no "não sei o que escrever". Depois do campo, ninguém lê. */}
              <p className="mv3-dica">
                Uma frase basta —{' '}
                <em>
                  &ldquo;Meus sentimentos, {primeiroNome} vai fazer
                  falta.&rdquo;
                </em>
              </p>
              <textarea
                id="hom-texto"
                placeholder="Escreva aqui uma lembrança, uma oração ou uma palavra de conforto…"
                value={valores.texto}
                onChange={(e) => campo('texto', e.target.value)}
                maxLength={600}
                ref={textoRef}
                aria-invalid={erros.texto ? true : undefined}
                aria-describedby={erros.texto ? 'hom-texto-erro' : undefined}
              />
              {erros.texto && (
                <span className="mv3-erro" id="hom-texto-erro">
                  {erros.texto}
                </span>
              )}

              {/* honeypot invisível — sem rótulo de propósito: só robô preenche */}
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                title="Deixe este campo em branco"
                style={{
                  position: 'absolute',
                  left: '-9999px',
                  width: 1,
                  height: 1,
                }}
                value={valores.website}
                onChange={(e) => campo('website', e.target.value)}
              />

              <div id="vela" className="mv3-vela-rot">
                Acender uma vela{' '}
                <span style={{ opacity: 0.6, fontWeight: 400 }}>
                  — gratuito, e aparece na hora
                </span>
              </div>
              <div className="mv3-vela-destaque">
                <Vela grande tamanho={88} tipo={velaEscolhida} />
                <p>
                  A vela fica acesa na página de {primeiroNome}, com o seu nome,
                  para quem visitar depois.
                </p>
              </div>
              <label className="mv3-vela-toggle">
                <input
                  type="checkbox"
                  checked={valores.vela}
                  onChange={(e) => campo('vela', e.target.checked)}
                />
                <span>
                  <span className="tt">
                    Acender uma vela em memória de {primeiroNome}
                  </span>
                  <span className="ds">
                    Escolha abaixo o desenho, se quiser.
                  </span>
                </span>
              </label>

              {velaLigada && (
                <fieldset className="mv3-velas-escolha">
                  <legend className="sr">Desenho da vela</legend>
                  {TIPOS_VELA.map((t) => (
                    <label
                      key={t.id}
                      className={
                        velaEscolhida === t.id
                          ? 'mv3-vela-opcao mv3-vela-opcao--on'
                          : 'mv3-vela-opcao'
                      }
                    >
                      <input
                        type="radio"
                        name="desenho-da-vela"
                        value={t.id}
                        checked={velaEscolhida === t.id}
                        onChange={() => campo('velaTipo', t.id)}
                      />
                      <Vela tipo={t.id} tamanho={60} forma="placa" />
                      <span>{t.nome}</span>
                    </label>
                  ))}
                </fieldset>
              )}

              <p className="mv3-nota-priv">
                {memorial.moderarMensagens
                  ? 'A mensagem aparece assim que a família confirmar — costuma levar poucos minutos. A vela é registrada na hora.'
                  : 'Sua homenagem aparece na hora. Contamos com o respeito de todos neste momento.'}{' '}
                Ao enviar, você concorda com a exibição da sua homenagem nesta
                página, conforme a{' '}
                <Link to="/privacidade">Política de Privacidade</Link>.
              </p>

              <div className="mv3-enviar mv3-enviar--org">
                <button
                  className="mv3-btn mv3-btn--ouro"
                  type="submit"
                  disabled={enviando}
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
                      {h.vela ? (
                        <Vela tipo={h.velaTipo} tamanho={44} />
                      ) : (
                        iniciais(h.nome) || '·'
                      )}
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
            <h2 className="mv3-h2">Compartilhe a notícia</h2>
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
                  Publicação autorizada por <b>{memorial.autorizadoPor}</b>
                  .{' '}
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
              <b>Confira o nome, os textos e os horários.</b> Depois de
              publicar, o endereço da página não muda — mas o conteúdo continua
              editável.
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

        {rodape && <div className="mv3-w">{rodape}</div>}

        {/* CTA fixo no mobile — o botão do herói some ao rolar e a homenagem
          fica a milhares de pixels; a barra mantém a ação sempre à mão. Só no
          trecho em que ela serve: ver `useBarraFixa`. */}
        {!preview && (
          <nav
            className={`mv3-mobicta${mostrarBarraFixa ? '' : ' mv3-mobicta--fora'}`}
            aria-label="Ação rápida"
            aria-hidden={!mostrarBarraFixa}
          >
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
 * TODOS os memoriais usam o modelo atual desde 18/08/2026.
 *
 * Até aqui havia uma lista de slugs (`amalia-teresa-justen` e
 * `marli-cordeiro-de-almeida`) que continuavam no `MemorialLegado`, por
 * decisão de 09/08: "os já publicados deixe como estão". O Felipe reabriu em
 * 18/08 e pediu os dois no modelo novo — e o motivo prático pesa: as melhorias
 * do dia (velas escolhíveis, mês no intervalo, correção do mural, formulário
 * reorganizado) chegavam só ao modelo atual, então as duas únicas notas reais
 * da cliente eram justamente as que NÃO as recebiam.
 *
 * `MemorialLegado.tsx` fica no repositório como referência do visual anterior,
 * mas deixa de ser importado — e portanto sai do bundle.
 * ------------------------------------------------------------------ */
export default function MemorialPage(
  props: {
    memorialOverride?: Memorial
    preview?: boolean
    faixa?: React.ReactNode
    rodape?: React.ReactNode
  } = {},
) {
  return <MemorialModerno {...props} />
}
