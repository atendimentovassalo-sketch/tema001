/* Cabeçalho e rodapé do site institucional reaproveitados nas páginas do app —
 * obituário, memorial e formulário. Objetivo: quem navega não deve perceber
 * que trocou de sistema.
 *
 * TUDO AQUI VEM DO INQUILINO (`f`), e isso não é preferência de estilo.
 * Até 20/08/2026 o nome, o telefone, o e-mail, o endereço e as cidades da
 * Funerária São Francisco estavam escritos neste arquivo. Como esta casca
 * envolve TODA página de memorial e de obituário, a segunda funerária a entrar
 * teria as páginas dela exibindo os dados da primeira — e uma família enlutada
 * em outra cidade ligaria para a funerária errada. Os campos que faltavam
 * (e-mail, menu, horário, dados jurídicos) vieram na migration 0015.
 *
 * `f` pode ser null: acontece quando o host não corresponde a nenhuma
 * funerária. Aí a casca fica sem marca — melhor sem nome nenhum do que com o
 * nome de outra casa.
 *
 * Tudo escopado em .sfc; os links do site saem do SPA de propósito
 * (<a> comum, não <Link>), porque as páginas institucionais são estáticas. */
import type { ReactNode } from 'react'
import type { Funeraria, ItemMenu } from '@/pages/memorial/types'
import './site-chrome.css'

/** Menu de quem não tem site institucional: só o obituário, que é do app e
 *  existe para todo inquilino. Nunca linkar /planos ou /cidade-x de outra
 *  funerária — seriam 404 no domínio dela. */
const MENU_MINIMO: ItemMenu[] = [{ rotulo: 'Obituários', href: '/obituario' }]

function menuDe(f: Funeraria | null | undefined): ItemMenu[] {
  return f?.siteMenu?.length ? f.siteMenu : MENU_MINIMO
}

/** Para onde a marca leva: a primeira entrada do menu (a home, quando existe
 *  site institucional) ou o obituário. */
function inicioDe(f: Funeraria | null | undefined): string {
  const m = menuDe(f)
  return m[0]?.href ?? m[0]?.itens?.[0]?.href ?? '/obituario'
}

function zapDe(f: Funeraria | null | undefined): string | null {
  return f?.whatsapp ? `https://wa.me/${f.whatsapp}` : null
}

/** Menu achatado: o rodapé lista tudo em coluna, sem submenu. */
function linksPlanos(f: Funeraria | null | undefined) {
  const saida: { rotulo: string; href: string }[] = []
  for (const i of menuDe(f)) {
    if (i.href) saida.push({ rotulo: i.rotulo, href: i.href })
    for (const sub of i.itens ?? []) saida.push(sub)
  }
  return saida
}

/** Texto livre com quebras de linha vira <br> — é assim que o horário e o
 *  bloco jurídico chegam do banco. */
function emLinhas(texto: string): ReactNode[] {
  return texto.split('\n').map((linha, i) => (
    <span key={i}>
      {i > 0 && <br />}
      {linha}
    </span>
  ))
}

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

/** Botão flutuante do WhatsApp — some quando não há inquilino resolvido. */
function BotaoZap({ f }: { f: Funeraria | null | undefined }) {
  const zap = zapDe(f)
  if (!zap) return null
  return (
    <a
      className="wa-float"
      href={zap}
      target="_blank"
      rel="noopener"
      aria-label={`Falar no WhatsApp com ${f?.nome ?? 'a funerária'}`}
    >
      <IconeWhatsapp />
    </a>
  )
}

const NAV_CSS = `
.hdr .nav-areas{position:relative;display:inline-flex;align-items:center}
.hdr .nav-areas>summary{display:inline-flex;align-items:center;list-style:none;cursor:pointer;font-family:var(--sans,Figtree,system-ui,sans-serif)!important;font-size:.96rem!important;font-weight:450!important;letter-spacing:0!important;color:var(--ink,#1A1712);padding:0 0 4px!important;border-bottom:1px solid transparent;white-space:nowrap}
.hdr .nav-areas>summary::-webkit-details-marker{display:none}
.hdr .nav-areas>summary::marker{content:''}
.hdr .nav-areas>summary::after{content:'\\25BE'!important;font-family:var(--sans,Figtree,system-ui,sans-serif)!important;font-size:.72em!important;font-weight:400!important;color:var(--muted,#565049)!important;margin-left:7px}
.hdr .nav-areas[open]>summary{border-color:var(--bordo,#8A6828)}
.hdr .nav-areas-menu{position:absolute;top:calc(100% + 10px);left:0;background:var(--card,#fff);border:1px solid var(--hair,#E4E0D6);border-radius:12px;padding:8px;min-width:210px;box-shadow:0 16px 36px -14px rgba(0,0,0,.28);z-index:120;display:flex;flex-direction:column;gap:2px}
.hdr .nav-areas-menu a{display:block;text-align:left;padding:9px 12px;border-radius:8px;text-decoration:none;font-size:.94rem;color:var(--ink,#1A1712);border:0}
.hdr .nav-areas-menu a:hover{background:var(--p2,#F3F0E8);border:0}
@media(max-width:1060px){.hdr .w{flex-wrap:wrap;justify-content:center;row-gap:10px}.hdr .nav{display:flex!important;flex-wrap:wrap;justify-content:center;gap:12px 18px;width:100%}}
`

export function SiteHeader({
  f,
  aqui,
}: {
  f: Funeraria | null | undefined
  aqui?: 'obituario'
}) {
  return (
    /* O wrapper `.sfc` NÃO é decoração: todo o CSS deste cabeçalho está escopado
     * em `.sfc .hdr`, e sem um ancestral com essa classe o cabeçalho sai CRU —
     * marca e menu empilhados em Times New Roman. Era o que acontecia em
     * /memorial/novo e em /aprovar/:token, que usam este componente solto em vez
     * do SiteShell (que já traz o wrapper). Aninhar dois `.sfc` é inofensivo: as
     * variáveis são as mesmas.
     *
     * `display: contents` para o wrapper não virar um bloco entre o header e o
     * conteúdo — o `.hdr` é `position: sticky`, e um pai extra com altura
     * própria quebraria a fixação no topo. */
    <div className="sfc" style={{ display: 'contents' }}>
      <style dangerouslySetInnerHTML={{ __html: NAV_CSS }} />
      <header className="hdr">
        <div className="w">
          <a className="mark" href={inicioDe(f)}>
            {f?.nome ?? ''}
          </a>
          <nav className="nav" aria-label="Navegação principal">
            {menuDe(f).map((item) =>
              item.itens?.length ? (
                <details className="nav-areas" key={item.rotulo}>
                  <summary>{item.rotulo}</summary>
                  <div className="nav-areas-menu">
                    {item.itens.map((sub) => (
                      <a href={sub.href} key={sub.href}>
                        {sub.rotulo}
                      </a>
                    ))}
                  </div>
                </details>
              ) : (
                <a
                  href={item.href}
                  key={item.rotulo}
                  aria-current={
                    aqui === 'obituario' && item.href === '/obituario'
                      ? 'page'
                      : undefined
                  }
                >
                  {item.rotulo}
                </a>
              ),
            )}
          </nav>
        </div>
      </header>
    </div>
  )
}

export function SiteFooter({ f }: { f: Funeraria | null | undefined }) {
  if (!f) return null
  const zap = zapDe(f)
  const navegar = linksPlanos(f)
  return (
    <footer className="site">
      <div className="w">
        <div className={f.siteLegal ? 'cols' : 'cols cols--3'}>
          <div>
            <p className="fm">{f.nome}</p>
            {f.endereco && (
              <p style={{ fontSize: '.92rem' }}>{emLinhas(f.endereco)}</p>
            )}
            {f.siteHorario && (
              <p style={{ marginTop: 18, fontSize: '.92rem' }}>
                {emLinhas(f.siteHorario)}
              </p>
            )}
          </div>
          <div>
            <h2>Navegar</h2>
            {navegar.map((l) => (
              <a href={l.href} key={l.href}>
                {l.rotulo}
              </a>
            ))}
          </div>
          <div>
            <h2>Contato</h2>
            {/* O tel: usa os dígitos do WhatsApp (já em formato internacional);
                o rótulo mostra o telefone como a funerária o escreve. */}
            {f.whatsapp && <a href={`tel:+${f.whatsapp}`}>{f.telefone}</a>}
            {zap && <a href={zap}>WhatsApp</a>}
            {f.email && (
              <>
                <a href={`mailto:${f.email}`}>{f.email}</a>
                <a href={`mailto:${f.email}`}>Ouvidoria</a>
              </>
            )}
          </div>
          {f.siteLegal && (
            <div>
              <h2>Empresa</h2>
              <p style={{ fontSize: '.92rem' }}>{emLinhas(f.siteLegal)}</p>
            </div>
          )}
        </div>
        <div className="fbot">
          <span>
            © {new Date().getFullYear()} {f.nome}
          </span>
          <span>
            <a href="/privacidade">Política de privacidade</a> ·{' '}
            <a href="/termos">Termos de uso</a>
          </span>
        </div>
      </div>
    </footer>
  )
}

export function SiteBarras({ f }: { f: Funeraria | null | undefined }) {
  return <BotaoZap f={f} />
}

/* Cabeçalho mínimo: só o nome da casa, discreto, não fixo.
 * Usado no memorial — página íntima da família, sem nav/telefone/cidades. */
function SiteHeaderMinimo({ f }: { f: Funeraria | null | undefined }) {
  return (
    <header className="hdr" style={{ position: 'static' }}>
      <div className="w" style={{ justifyContent: 'center' }}>
        <a className="mark" href={inicioDe(f)} style={{ textAlign: 'center' }}>
          {f?.nome ?? ''}
        </a>
      </div>
    </header>
  )
}

/** Linha de cidades do rodapé mínimo: as áreas atendidas quando a funerária as
 *  declara, senão a cidade dela. */
function areasDe(f: Funeraria | null | undefined): string {
  const areas = menuDe(f)
    .flatMap((i) => i.itens ?? [])
    .map((s) => s.rotulo)
  if (areas.length) return areas.join(' · ')
  return f ? `${f.cidade} / ${f.uf}` : ''
}

/* Rodapé mínimo: uma assinatura discreta, sem colunas de marketing. */
function SiteFooterMinimo({ f }: { f: Funeraria | null | undefined }) {
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
        {f?.nome ?? ''}
      </p>
      <p
        style={{
          fontSize: '.85rem',
          color: 'var(--muted, #6b6459)',
          margin: '6px 0 0',
        }}
      >
        {areasDe(f)}
      </p>
      <p
        style={{
          fontSize: '.78rem',
          color: 'var(--muted, #6b6459)',
          margin: '16px 0 0',
        }}
      >
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

/** Primeiro elemento focável da página: pula cabeçalho e vai ao conteúdo.
 *
 *  POR QUE (18/08/2026, achado pelo gate `verifica-memorial` no fechamento):
 *  sem ele, quem navega por teclado ou leitor de tela atravessa o cabeçalho e o
 *  botão flutuante do WhatsApp a cada página antes de chegar ao que veio ler —
 *  numa nota de falecimento, isso é atravessar a marca da funerária para chegar
 *  ao nome do falecido.
 *
 *  Fica escondido até receber foco: é a convenção, e evita mais um elemento na
 *  tela de uma página que passou o dia sendo despoluída. */
function PularParaConteudo() {
  return (
    <a className="sfc-pular" href="#conteudo">
      Pular para o conteúdo
    </a>
  )
}

/** Casca completa: cabeçalho e rodapé do site em volta do conteúdo do app.
 *  minimal=true → versão íntima (memorial): topo só com o nome, rodapé discreto,
 *  e apenas o botão flutuante do WhatsApp (sem barra dupla nem menu). */
export function SiteShell({
  children,
  f,
  aqui,
  minimal,
}: {
  children: ReactNode
  f: Funeraria | null | undefined
  aqui?: 'obituario'
  minimal?: boolean
}) {
  if (minimal) {
    return (
      <div className="sfc">
        <PularParaConteudo />
        <SiteHeaderMinimo f={f} />
        <div id="conteudo" tabIndex={-1}>
          {children}
        </div>
        <SiteFooterMinimo f={f} />
        <BotaoZap f={f} />
      </div>
    )
  }
  return (
    <div className="sfc">
      <PularParaConteudo />
      <SiteHeader f={f} aqui={aqui} />
      {/* tabIndex -1 para o alvo receber o foco de verdade ao saltar; sem isso o
          navegador rola até lá mas o foco fica onde estava, e a próxima tecla
          volta para o cabeçalho. */}
      <div id="conteudo" tabIndex={-1}>
        {children}
      </div>
      <SiteFooter f={f} />
      <SiteBarras f={f} />
    </div>
  )
}
