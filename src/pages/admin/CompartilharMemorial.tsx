/* Os dois links de um memorial, lado a lado — porque eles vivem juntos na
 * cabeça de quem atende, e separá-los é o que faz alguém mandar o errado.
 *
 *   PÚBLICO  (/m/<slug>)          — para circular. É a nota de falecimento.
 *   GESTÃO   (/memorial/familia/) — para UMA pessoa. Não pede senha: quem tem o
 *                                   endereço edita a página e aprova mensagens.
 *
 * O desenho separa os dois com força de propósito: cor, rótulo e um aviso
 * explícito no de gestão. Trocar um pelo outro num grupo de WhatsApp de cidade
 * pequena significa dar a estranhos o poder de alterar a página de um morto.
 */
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { linkWhatsApp } from '@/lib/whatsapp'

interface Props {
  memorialId: string
  slug: string
  nome: string
  publicado: boolean
}

export default function CompartilharMemorial({
  memorialId,
  slug,
  nome,
  publicado,
}: Props) {
  const [gestaoUrl, setGestaoUrl] = useState<string | null>(null)
  const [gerando, setGerando] = useState(false)
  const [funeraria, setFuneraria] = useState('Funerária')

  const publicoUrl = `${window.location.origin}/m/${slug}`

  useEffect(() => {
    api
      .get<{ config?: { nome?: string } }>('/api/admin/config')
      .then((r) => r.config?.nome && setFuneraria(r.config.nome))
      .catch(() => {})
  }, [])

  async function copiar(url: string, oque: string) {
    try {
      await navigator.clipboard.writeText(url)
      toast.success(`${oque} copiado.`)
    } catch {
      /* clipboard bloqueado: melhor mostrar do que fingir que copiou */
      toast.success(url)
    }
  }

  async function gerarGestao() {
    setGerando(true)
    try {
      const r = await api.post<{ ok: true; url: string; dias: number }>(
        `/api/admin/memoriais/${memorialId}/familia`,
      )
      setGestaoUrl(r.url)
      toast.success(`Link de gestão gerado — vale ${r.dias} dias.`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Não deu para gerar.')
    } finally {
      setGerando(false)
    }
  }

  /* Revogar é diferente de "gerar outro": aqui o memorial fica SEM link nenhum.
   * É o que se faz quando o link vazou e ninguém mais deveria editar a página. */
  async function revogar() {
    if (
      !confirm(
        'Revogar o link de gestão? Quem tiver o endereço perde o acesso na hora, ' +
          'e a família precisará de um link novo para editar a página.',
      )
    )
      return
    try {
      await api.del(`/api/admin/memoriais/${memorialId}/familia`)
      setGestaoUrl(null)
      toast.success('Link revogado. Ninguém mais consegue editar a página.')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Não deu para revogar.')
    }
  }

  function abrir(url: string) {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const textoPublico =
    `Nota de falecimento de ${nome}.\n\n${publicoUrl}\n\n` +
    `Pode compartilhar à vontade — com a família, com amigos, em grupos.\n\n— ${funeraria}`

  const textoGestao = gestaoUrl
    ? `Este link é para VOCÊ cuidar da página de ${nome} — escrever a história, ` +
      `acrescentar fotos e aprovar ou esconder as mensagens que chegarem:\n${gestaoUrl}\n\n` +
      `⚠️ Por favor, NÃO repasse este link em grupos nem para outras pessoas. ` +
      `Ele não pede senha: quem tiver o endereço consegue alterar a página. ` +
      `Guarde só com você, ou com uma pessoa da família de sua confiança.\n\n` +
      `Para divulgar o falecimento, use o outro link, o da página em si — ` +
      `esse pode circular à vontade.\n\n` +
      `O acesso vale 30 dias.\n\n— ${funeraria}`
    : ''

  return (
    <div className="lnk">
      <div className="lnk-cartao">
        <div className="lnk-cab">
          <strong>Link da página</strong>
          <span className="lnk-tag lnk-tag-ok">pode circular</span>
        </div>
        <p className="lnk-url">{publicoUrl}</p>
        {!publicado && (
          <p className="lnk-aviso-off">
            O memorial está como rascunho — o link só abre depois de publicar.
          </p>
        )}
        <div className="lnk-acoes">
          <button
            className="adm-btn adm-btn-mini adm-btn-fantasma"
            onClick={() => copiar(publicoUrl, 'Link da página')}
          >
            Copiar
          </button>
          <button
            className="adm-btn adm-btn-mini adm-btn-fantasma"
            onClick={() =>
              abrir(`https://wa.me/?text=${encodeURIComponent(textoPublico)}`)
            }
          >
            Enviar no WhatsApp
          </button>
          <button
            className="adm-btn adm-btn-mini adm-btn-fantasma"
            onClick={() => abrir(publicoUrl)}
          >
            Abrir
          </button>
        </div>
      </div>

      <div className="lnk-cartao lnk-cartao-restrito">
        <div className="lnk-cab">
          <strong>Link de gestão</strong>
          <span className="lnk-tag lnk-tag-alerta">só para uma pessoa</span>
        </div>
        <p className="lnk-explica">
          Permite escrever a história, subir fotos e aprovar ou esconder
          mensagens. <strong>Não pede senha</strong> — quem tiver o endereço
          altera a página. Vale 30 dias.
        </p>

        {gestaoUrl ? (
          <>
            <p className="lnk-url">{gestaoUrl}</p>
            <div className="lnk-acoes">
              <button
                className="adm-btn adm-btn-mini adm-btn-fantasma"
                onClick={() => copiar(gestaoUrl, 'Link de gestão')}
              >
                Copiar
              </button>
              <button
                className="adm-btn adm-btn-mini adm-btn-fantasma"
                onClick={() =>
                  abrir(
                    `https://wa.me/?text=${encodeURIComponent(textoGestao)}`,
                  )
                }
              >
                Enviar no WhatsApp (com o aviso)
              </button>
              <button
                className="adm-btn adm-btn-mini adm-btn-fantasma"
                onClick={gerarGestao}
                disabled={gerando}
                title="Gera um link novo e invalida este na hora"
              >
                Gerar outro
              </button>
              <button
                className="adm-btn adm-btn-mini adm-btn-fantasma lnk-revogar"
                onClick={revogar}
                title="Deixa o memorial sem nenhum link de gestão"
              >
                Revogar
              </button>
            </div>
            <p className="lnk-nota">
              <strong>Gerar outro</strong> troca o link e invalida este na hora.{' '}
              <strong>Revogar</strong> tira o acesso sem criar outro — use se o
              link vazou e ninguém deve editar a página.
            </p>
          </>
        ) : (
          <div className="lnk-acoes">
            <button
              className="adm-btn adm-btn-mini adm-btn-primario"
              onClick={gerarGestao}
              disabled={gerando}
            >
              {gerando ? 'Gerando…' : 'Gerar link de gestão'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
