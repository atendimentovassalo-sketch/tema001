/* Home v2 da funerária — direção "dignidade calma".
 * Ordem invertida do mercado: presença e "o que fazer agora" antes de plano.
 * Front-end apenas; usa a funerária e os publicados do mock. */
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchPublicados } from './api'
import type { Funeraria, Memorial } from './types'
import { anoBR, ddmm, iniciais, retratoDe } from './format'
import './homev2.css'

const IMG = (q: string, w = 900, h = 1100, seed = 1) =>
  `https://img.usecurling.com/p/${w}/${h}?q=${encodeURIComponent(q)}&seed=${seed}`

const SERVICOS = [
  {
    t: 'Velório',
    d: 'Local, ornamentação e estrutura prontos, com a equipe presente o tempo todo.',
  },
  {
    t: 'Sepultamento e cremação',
    d: 'Conduzimos a escolha e toda a logística, no tempo da sua família.',
  },
  {
    t: 'Traslado',
    d: 'Transporte com cuidado e respeito, na cidade ou entre cidades.',
  },
  {
    t: 'Documentação',
    d: 'Cuidamos da papelada e das certidões para você não se preocupar com isso agora.',
  },
  {
    t: 'Flores e homenagens',
    d: 'Coroas, arranjos e a página de memorial online para quem não pôde vir.',
  },
  {
    t: 'Apoio no luto',
    d: 'Orientação e encaminhamento para quem precisar de acolhimento depois.',
  },
]

function useReveal(dep?: unknown) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const root = ref.current
    if (!root) return
    const els = root.querySelectorAll<HTMLElement>('.reveal')
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('in'))
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in')
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.14 },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
    // re-observa quando o conteúdo carrega
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dep])
  return ref
}

export default function HomeV2() {
  const [dados, setDados] = useState<{
    funeraria: Funeraria
    ultimos: Memorial[]
  } | null>(null)
  const root = useReveal(dados)

  useEffect(() => {
    let vivo = true
    fetchPublicados({ limite: 4 })
      .then((r) => {
        if (vivo) setDados({ funeraria: r.funeraria, ultimos: r.memoriais })
      })
      .catch(() => {
        if (vivo) setDados({ funeraria: null as unknown as Funeraria, ultimos: [] })
      })
    return () => {
      vivo = false
    }
  }, [])

  useEffect(() => {
    if (dados?.funeraria)
      document.title = `${dados.funeraria.nome} — Funerária 24 horas em ${dados.funeraria.cidade}/${dados.funeraria.uf}`
  }, [dados])

  if (!dados || !dados.funeraria) {
    return <div className="homev2" style={{ minHeight: '100vh' }} />
  }

  const f = dados.funeraria
  const ultimos = dados.ultimos
  const destaque = ultimos[0]
  const velasDestaque = destaque
    ? destaque.homenagens.filter((h) => h.vela).length
    : 0

  const telHref = `tel:${f.telefone.replace(/[^0-9+]/g, '')}`
  const zapHref = `https://wa.me/${f.whatsapp}`

  return (
    <div className="homev2" ref={root}>
      {/* barra */}
      <header className="bar">
        <div className="bar-in">
          <a  className="brand" href="/">
            {f.nome}
            <small>
              {f.cidade} · {f.uf}
            </small>
          </a>
          <a className="fone" href={telHref}>
            <em>Atendimento 24 horas</em>
            <b className="num">{f.telefone}</b>
          </a>
        </div>
      </header>

      {/* HERO */}
      <section className="hero">
        <div className="hero-txt reveal">
          <p className="kicker">
            {f.desde
              ? `Ao lado das famílias de ${f.cidade} desde ${f.desde}`
              : `${f.cidade} e região`}
          </p>
          <h1>Quando o pior acontece, você não precisa saber o que fazer.</h1>
          <p className="lede">
            A gente conduz cada passo — do velório à despedida — e cuida para
            que reste só o que importa: estar com quem você ama.
          </p>
          <div className="ctas">
            <a className="btn solid" href={telHref}>
              Ligar agora · 24 horas
            </a>
            <a
              className="btn ghost"
              href={zapHref}
              target="_blank"
              rel="noopener noreferrer"
            >
              Falar no WhatsApp
            </a>
          </div>
          <div className="trust">
            <span>
              <b></b> Chegamos rápido em {f.cidade}
            </span>
            <span>
              <b></b> A mesma equipe do começo ao fim
            </span>
            {f.desde && (
              <span>
                <b></b> Na cidade desde {f.desde}
              </span>
            )}
          </div>
        </div>
        {/* mockup do produto: mostra a página de memorial (o diferencial)
            em vez de uma foto de cortina genérica */}
        <div className="hero-fig" aria-hidden="true">
          {destaque && (
            <>
              <div className="fone">
                <div className="fone-tela">
                  <span className="mini-eti">Em memória de</span>
                  <div className="mini-retrato">
                    {retratoDe(destaque) ? (
                      <img src={retratoDe(destaque)!} alt="" loading="eager" />
                    ) : (
                      <span className="ini">
                        {iniciais(destaque.nomeCompleto)}
                      </span>
                    )}
                  </div>
                  <p className="mini-nome">{destaque.nomeCompleto}</p>
                  <p className="mini-datas num">
                    {destaque.nascimentoISO
                      ? `${anoBR(destaque.nascimentoISO)} – `
                      : ''}
                    {anoBR(destaque.falecimentoISO)}
                  </p>
                  {destaque.epitafio && (
                    <p className="mini-epi">
                      &ldquo;{destaque.epitafio}&rdquo;
                    </p>
                  )}
                  <p className="mini-velas">
                    🕯️ {velasDestaque}{' '}
                    {velasDestaque === 1 ? 'vela acesa' : 'velas acesas'}
                  </p>
                </div>
              </div>
              <div className="sat sat-a">
                <span className="sat-k">Velório hoje</span>
                <span className="sat-v">19h · Capela São José</span>
              </div>
              <div className="sat sat-b">
                <span className="sat-k">Publicado em minutos</span>
                <span className="sat-v">Foto, datas e local</span>
              </div>
            </>
          )}
        </div>
      </section>

      {/* O QUE FAZER AGORA */}
      <section className="blk paper">
        <div className="container">
          <div className="reveal">
            <p className="eyebrow">Acabou de acontecer?</p>
            <h2>O que fazer agora — em três passos.</h2>
            <p className="intro">
              Você não precisa resolver nada sozinho. A partir da sua ligação, o
              caminho é este:
            </p>
          </div>
          <div className="passos">
            <div className="passo reveal">
              <span className="n">01</span>
              <h3>Você liga</h3>
              <p>
                Um número, a qualquer hora do dia ou da noite. Quem atende já
                sabe o que perguntar — e o que não perguntar.
              </p>
            </div>
            <div className="passo reveal">
              <span className="n">02</span>
              <h3>A gente vai até você</h3>
              <p>
                Cuidamos da remoção e orientamos os primeiros passos. Você fica
                com a família; a logística é conosco.
              </p>
            </div>
            <div className="passo reveal">
              <span className="n">03</span>
              <h3>Conduzimos tudo</h3>
              <p>
                Velório, documentação, sepultamento ou cremação. Você decide o
                essencial; nós resolvemos o resto.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* OBITUÁRIO RECENTE */}
      <section className="blk">
        <div className="container">
          <div className="reveal">
            <p className="eyebrow sage">Obituário</p>
            <h2>Falecimentos recentes</h2>
            <p className="intro">
              As últimas notas publicadas. Cada página guarda a homenagem de
              quem ficou.
            </p>
          </div>
          <div className="lista reveal">
            {ultimos.map((m) => (
              <Link key={m.id} to={`/m/${m.slug}`}>
                <span className="foto">
                  {retratoDe(m) ? (
                    <img src={retratoDe(m)!} alt="" loading="lazy" />
                  ) : (
                    <span className="ini" aria-hidden="true">
                      {iniciais(m.nomeCompleto)}
                    </span>
                  )}
                </span>
                <span className="nm">{m.nomeCompleto}</span>
                <span className="dt num">{ddmm(m.falecimentoISO)}</span>
              </Link>
            ))}
          </div>
          <Link className="vermais" to="/obituario">
            Ver todo o obituário →
          </Link>
        </div>
      </section>

      {/* QUEM CUIDA DE VOCÊ */}
      <section className="blk paper">
        <div className="container">
          <div className="duo">
            <div className="col-txt reveal">
              <p className="eyebrow">Quem cuida de você</p>
              <h2>Gente da cidade, ao lado da sua família.</h2>
              {f.sobre && <p className="big">{f.sobre}</p>}
              <p className="small">
                Não é um call center. É a equipe que você encontra na rua,
                atendendo com a discrição e o respeito que este momento pede.
              </p>
            </div>
            <div className="col-img reveal">
              <img
                src={IMG(
                  'two hands holding gently warm natural light care',
                  1000,
                  800,
                  3,
                )}
                alt="Mãos que acolhem"
                loading="lazy"
                onError={(e) => {
                  // se o serviço de imagem falhar, some e fica o gradiente quente
                  e.currentTarget.style.display = 'none'
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* COMO AJUDAMOS */}
      <section className="blk">
        <div className="container">
          <div className="reveal">
            <p className="eyebrow sage">Como ajudamos</p>
            <h2>Tudo o que pesa, a gente carrega junto.</h2>
          </div>
          <div className="servs reveal">
            {SERVICOS.map((s) => (
              <div className="serv" key={s.t}>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DEPOIMENTO */}
      <section className="blk paper">
        <div className="container">
          <div className="quote reveal">
            <span className="aspas" aria-hidden="true">
              &ldquo;
            </span>
            <p>
              Eu não sabia por onde começar. Eles chegaram, cuidaram de cada
              detalhe, e me deixaram fazer a única coisa que importava: ficar
              com a minha mãe.
            </p>
            <p className="autor">Marcos A. · Catanduvas</p>
          </div>
        </div>
      </section>

      {/* ANTECIPE */}
      <section className="blk">
        <div className="container">
          <div className="antecipe reveal">
            <div>
              <p className="eyebrow">Com calma, hoje</p>
              <h2>Decida agora para que ninguém precise decidir na dor.</h2>
              <p>
                Deixar tudo combinado é um gesto de cuidado com quem fica. Sem
                pressa e sem compromisso — a gente conversa quando você quiser.
              </p>
            </div>
            <div className="side">
              <a
                className="btn on-dark"
                href={zapHref}
                target="_blank"
                rel="noopener noreferrer"
              >
                Conversar sem compromisso
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* RODAPÉ */}
      <footer className="rodape">
        <p className="brand">
          {f.nome}
          <small>Atendimento 24 horas</small>
        </p>
        <p className="end">
          {f.endereco}
          <br />
          {f.cidade} · {f.uf}
        </p>
        <a className="tel-big num" href={telHref}>
          <small>Ligue a qualquer hora</small>
          {f.telefone}
        </a>
        <div className="zap">
          <a
            className="btn on-dark"
            href={zapHref}
            target="_blank"
            rel="noopener noreferrer"
          >
            Falar no WhatsApp
          </a>
        </div>
        <p className="rodape-legal">
          <Link to="/privacidade">Política de Privacidade</Link>
          <span aria-hidden="true"> · </span>
          <Link to="/termos">Termos de Uso</Link>
          <span aria-hidden="true"> · </span>
          <Link to="/admin/login">Acesso da funerária</Link>
        </p>
      </footer>

      {/* CTA fixo no mobile — o herói some ao rolar; mantém a ação à mão */}
      <nav className="mobicta" aria-label="Ações rápidas">
        <a className="mb-btn solid" href={telHref}>
          Ligar · 24h
        </a>
        <a
          className="mb-btn zap"
          href={zapHref}
          target="_blank"
          rel="noopener noreferrer"
        >
          WhatsApp
        </a>
      </nav>
    </div>
  )
}
