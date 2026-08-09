/* Cabeçalho e rodapé do site institucional (funerariacatanduvas.com.br)
 * reaproveitados nas páginas do app — obituário, memorial e formulário.
 * Objetivo: quem navega não deve perceber que trocou de sistema.
 * Tudo escopado em .sfc; os links do site saem do SPA de propósito
 * (<a> comum, não <Link>), porque as páginas institucionais são estáticas. */
import type { ReactNode } from 'react'
import './site-chrome.css'

const TEL = '+5545991284521'
const TEL_LEGIVEL = '(45) 99128-4521'
const ZAP = 'https://wa.me/5545991284521'
const EMAIL = 'atendimento@funerariacatanduvas.com.br'

function IconeWhatsapp() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <path
        fill="#fff"
        d="M16.04 3.2c-7.06 0-12.8 5.74-12.8 12.8 0 2.26.59 4.46 1.72 6.4L3.2 28.8l6.56-1.72a12.74 12.74 0 0 0 6.28 1.6h.01c7.05 0 12.79-5.74 12.79-12.8 0-3.42-1.33-6.63-3.75-9.05a12.71 12.71 0 0 0-9.05-3.63Zm0 23.31h-.01a10.6 10.6 0 0 1-5.4-1.48l-.39-.23-4.01 1.05 1.07-3.91-.25-.4a10.57 10.57 0 0 1-1.62-5.65c0-5.86 4.77-10.63 10.63-10.63 2.84 0 5.5 1.11 7.51 3.12a10.55 10.55 0 0 1 3.11 7.52c0 5.86-4.77 10.61-10.64 10.61Zm5.83-7.95c-.32-.16-1.89-.93-2.18-1.04-.29-.11-.5-.16-.71.16-.21.32-.82 1.04-1.01 1.25-.18.21-.37.24-.69.08-.32-.16-1.35-.5-2.57-1.59-.95-.85-1.59-1.89-1.78-2.21-.18-.32-.02-.5.14-.66.15-.14.32-.37.48-.56.16-.19.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.71-1.73-.98-2.36-.26-.62-.52-.54-.71-.55l-.61-.01c-.21 0-.56.08-.85.4-.29.32-1.11 1.09-1.11 2.65s1.14 3.07 1.3 3.29c.16.21 2.24 3.42 5.43 4.8.76.33 1.35.52 1.81.67.76.24 1.45.21 2 .13.61-.09 1.89-.77 2.15-1.52.27-.75.27-1.38.19-1.52-.08-.13-.29-.21-.61-.37Z"
      />
    </svg>
  )
}

export function SiteHeader({ aqui }: { aqui?: 'obituario' }) {
  return (
    <>
      <div className="util">
        <div className="w">
          <span>Assistência funeral</span>
          <span className="sp" aria-hidden="true" />
          <span>Plantão 24 horas, todos os dias</span>
          <a href={`tel:${TEL}`}>{TEL_LEGIVEL}</a>
        </div>
      </div>
      <header className="hdr">
        <div className="w">
          <a className="mark" href="/">
            <img
              src="/logo.png"
              alt="Funerária São Francisco — Catanduvas/PR"
              style={{ height: 48, width: 'auto', maxWidth: 160 }}
            />
          </a>
          <nav className="nav" aria-label="Navegação principal">
            <a href="/obituario" aria-current={aqui === 'obituario' ? 'page' : undefined}>
              Obituário
            </a>
            <a href="/#horas">Primeiras horas</a>
            <a href="/#cuidados">Como cuidamos</a>
            <a href="/#casa">A funerária</a>
            <a href="/planos">Planos</a>
            <a href="/#duvidas">Dúvidas</a>
          </nav>
          <a className="btn btn--sm" href={`tel:${TEL}`}>
            Ligar agora
          </a>
        </div>
      </header>
    </>
  )
}

export function SiteFooter() {
  return (
    <footer className="site">
      <div className="w">
        <div className="cols">
          <div>
            <p className="fm">Funerária São Francisco</p>
            <p style={{ fontSize: '.92rem' }}>
              Av. Adolfo Chagas, 401 — Centro
              <br />
              Catanduvas / PR · CEP 85470-000
            </p>
            <p style={{ marginTop: 18, fontSize: '.92rem' }}>
              Atendimento presencial das 8h às 18h.
              <br />
              Plantão telefônico 24 horas, todos os dias.
            </p>
          </div>
          <div>
            <h2>Navegar</h2>
            <a href="/#horas">Primeiras horas</a>
            <a href="/obituario">Obituário</a>
            <a href="/#cuidados">Como cuidamos</a>
            <a href="/#casa">A funerária</a>
            <a href="/planos">Planos</a>
          </div>
          <div>
            <h2>Contato</h2>
            <a href={`tel:${TEL}`}>{TEL_LEGIVEL}</a>
            <a href={ZAP}>WhatsApp</a>
            <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
            <a href={`mailto:${EMAIL}`}>Ouvidoria</a>
          </div>
          <div>
            <h2>Empresa</h2>
            <p style={{ fontSize: '.92rem' }}>
              CNPJ 79.036.497/0001-58
              <br />
              Alvará nº 105, de 1989
              <br />
              Carvalho &amp; Borak Ltda
            </p>
          </div>
        </div>
        <div className="fbot">
          <span>© 2026 Funerária São Francisco</span>
          <span>
            <a href="/privacidade">Política de privacidade</a> ·{' '}
            <a href="/termos">Termos de uso</a>
          </span>
        </div>
      </div>
    </footer>
  )
}

export function SiteBarras() {
  return (
    <>
      <div className="callbar" role="complementary" aria-label="Ligar para o plantão">
        <a className="lig" href={`tel:${TEL}`}>
          <b>{TEL_LEGIVEL}</b>
          <span>Ligar agora · 24 horas</span>
        </a>
        <a className="zap" href={ZAP}>
          WhatsApp
        </a>
      </div>
      <a
        className="wa-float"
        href={ZAP}
        target="_blank"
        rel="noopener"
        aria-label="Falar com a Funerária São Francisco no WhatsApp"
      >
        <IconeWhatsapp />
      </a>
    </>
  )
}

/* Cabeçalho mínimo: só o nome da casa, discreto, não fixo.
 * Usado no memorial — página íntima da família, sem nav/telefone/cidades. */
function SiteHeaderMinimo() {
  return (
    <header className="hdr" style={{ position: 'static' }}>
      <div className="w" style={{ justifyContent: 'center' }}>
        <a className="mark" href="/" style={{ textAlign: 'center' }}>
          Funerária São Francisco
        </a>
      </div>
    </header>
  )
}

/* Rodapé mínimo: uma assinatura discreta, sem colunas de marketing. */
function SiteFooterMinimo() {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--hair, #E4E0D6)',
        padding: '48px 20px',
        textAlign: 'center',
        marginTop: 'clamp(48px, 8vw, 96px)',
      }}
    >
      <p
        style={{
          fontFamily: 'var(--display, Fraunces, Georgia, serif)',
          fontSize: '1.05rem',
          color: 'var(--ink, #1A1712)',
          margin: 0,
        }}
      >
        Funerária São Francisco
      </p>
      <p style={{ fontSize: '.85rem', color: 'var(--muted, #6b6459)', margin: '6px 0 0' }}>
        Catanduvas · Ibema · Três Barras do Paraná
      </p>
      <p style={{ fontSize: '.78rem', color: 'var(--muted, #6b6459)', margin: '16px 0 0' }}>
        <a href="/privacidade" style={{ color: 'inherit' }}>
          Privacidade
        </a>{' '}
        ·{' '}
        <a href="/termos" style={{ color: 'inherit' }}>
          Termos
        </a>
      </p>
    </footer>
  )
}

/** Casca completa: cabeçalho e rodapé do site em volta do conteúdo do app.
 *  minimal=true → versão íntima (memorial): topo só com o nome, rodapé discreto,
 *  e apenas o botão flutuante do WhatsApp (sem barra dupla nem menu). */
export function SiteShell({
  children,
  aqui,
  minimal,
}: {
  children: ReactNode
  aqui?: 'obituario'
  minimal?: boolean
}) {
  if (minimal) {
    return (
      <div className="sfc">
        <SiteHeaderMinimo />
        {children}
        <SiteFooterMinimo />
        <a
          className="wa-float"
          href={ZAP}
          target="_blank"
          rel="noopener"
          aria-label="Falar com a Funerária São Francisco no WhatsApp"
        >
          <IconeWhatsapp />
        </a>
      </div>
    )
  }
  return (
    <div className="sfc">
      <SiteHeader aqui={aqui} />
      {children}
      <SiteFooter />
      <SiteBarras />
    </div>
  )
}
