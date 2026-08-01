/* Tela de aprovação por link (o responsável abre pelo WhatsApp quando a família
 * modera). O :token identifica a homenagem pendente no backend. */
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { toast } from 'sonner'
import { fetchAprovacao, decidirAprovacao, type AprovacaoInfo } from './api'
import { iniciais, tempoRelativo } from './format'
import './memorial.css'

type Estado = 'carregando' | 'pendente' | 'aprovada' | 'recusada' | 'invalido'

export default function AprovarHomenagem() {
  const { token } = useParams()
  const [estado, setEstado] = useState<Estado>('carregando')
  const [info, setInfo] = useState<AprovacaoInfo | null>(null)
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    document.title = 'Aprovação de mensagem'
  }, [])

  useEffect(() => {
    if (!token) {
      setEstado('invalido')
      return
    }
    let vivo = true
    fetchAprovacao(token)
      .then((r) => {
        if (!vivo) return
        setInfo(r)
        setEstado('pendente')
      })
      .catch(() => {
        if (vivo) setEstado('invalido')
      })
    return () => {
      vivo = false
    }
  }, [token])

  async function decidir(acao: 'aprovar' | 'recusar') {
    if (!token) return
    setEnviando(true)
    try {
      await decidirAprovacao(token, acao)
      setEstado(acao === 'aprovar' ? 'aprovada' : 'recusada')
    } catch {
      toast.error('Não foi possível concluir. O link pode já ter sido usado.')
      setEnviando(false)
    }
  }

  const nome = info?.memorial?.nomeCompleto ?? 'seu ente querido'
  const pendente = info?.homenagem

  return (
    <div className="memorial-root">
      <header className="topo">
        <div className="topo-in">
          <span className="wm">
            Aprovação de mensagem
            <small>Link seguro do responsável</small>
          </span>
        </div>
      </header>

      <div className="form" style={{ maxWidth: 560 }}>
        {estado === 'carregando' && <p className="dica">Carregando…</p>}

        {estado === 'invalido' && (
          <div className="aviso" style={{ marginTop: 8 }}>
            <b>Link inválido ou já utilizado.</b> Esta mensagem pode já ter sido
            aprovada ou recusada. <Link to="/funeraria">Ir ao site</Link>.
          </div>
        )}

        {estado === 'pendente' && pendente && (
          <>
            <p className="eti" style={{ color: 'var(--brass-e)' }}>
              Nova mensagem para aprovar
            </p>
            <p className="dica" style={{ marginTop: 8 }}>
              Uma pessoa deixou uma homenagem em memória de <b>{nome}</b>. Ela só
              aparece na página depois que você aprovar.
            </p>

            <div className="feed" style={{ marginTop: 20 }}>
              <div className="item" style={{ borderBottom: 0 }}>
                <div className="av">{iniciais(pendente.nome) || '·'}</div>
                <div>
                  <span className="quem">{pendente.nome}</span>
                  <span className="qd">{tempoRelativo(pendente.criadoEmISO)}</span>
                  {pendente.texto ? (
                    <p className="tx">{pendente.texto}</p>
                  ) : (
                    <p className="tx">Acendeu uma vela</p>
                  )}
                </div>
              </div>
            </div>

            <div className="duo" style={{ marginTop: 24 }}>
              <button
                className="acao primaria"
                type="button"
                disabled={enviando}
                onClick={() => decidir('aprovar')}
              >
                Aprovar e publicar
              </button>
              <button
                className="acao vazia"
                type="button"
                disabled={enviando}
                onClick={() => decidir('recusar')}
              >
                Recusar
              </button>
            </div>
            <p className="mod">
              Aprovar publica a mensagem na página agora. Recusar descarta — a
              pessoa não é avisada.
            </p>
          </>
        )}

        {estado === 'aprovada' && (
          <div className="aviso" style={{ marginTop: 24 }}>
            <b>Mensagem publicada.</b> Ela já aparece na página de {nome}.
            Obrigado por cuidar disso.
          </div>
        )}

        {estado === 'recusada' && (
          <div className="aviso" style={{ marginTop: 24 }}>
            <b>Mensagem recusada.</b> Ela não será publicada e ninguém é avisado.
          </div>
        )}
      </div>
    </div>
  )
}
