/* Tela de aprovação por link (o responsável abre pelo WhatsApp quando a família modera).
 * Front-end apenas: o :token é ilustrativo; usa uma homenagem pendente de exemplo.
 * No backend, o token assinado identifica a mensagem e registra quem aprovou. */
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { getMemorial } from './memorial-data'
import { iniciais, tempoRelativo } from './format'
import './memorial.css'

type Decisao = 'pendente' | 'aprovada' | 'recusada'

export default function AprovarHomenagem() {
  const { token } = useParams()
  const memorial = getMemorial() // demo: primeiro memorial
  const f = memorial!.funeraria

  // Homenagem pendente de exemplo (viria do backend pelo token).
  const pendente = {
    nome: 'Vizinho do 302',
    texto:
      'Seu Zé foi o primeiro a me receber quando cheguei no bairro. Nunca vou esquecer. Meus sentimentos à família.',
    criadoEmISO: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
  }

  const [decisao, setDecisao] = useState<Decisao>('pendente')

  return (
    <div
      className="memorial-root"
      style={{ ['--marca' as string]: f.corMarca }}
    >
      <header className="topo">
        <div className="topo-in">
          <span className="wm">
            {f.nome}
            <small>Aprovação de mensagem</small>
          </span>
          <span className="tel">
            <span>
              <em>Responsável</em>
              <span className="num">Link seguro</span>
            </span>
          </span>
        </div>
      </header>

      <div className="form" style={{ maxWidth: 560 }}>
        <p className="eti" style={{ color: 'var(--brass-e)' }}>
          Nova mensagem para aprovar
        </p>
        <p className="dica" style={{ marginTop: 8 }}>
          Uma pessoa deixou uma homenagem em memória de{' '}
          <b>{memorial!.nomeCompleto}</b>. Ela só aparece na página depois que
          você aprovar.
        </p>

        {decisao === 'pendente' && (
          <>
            <div className="feed" style={{ marginTop: 20 }}>
              <div className="item" style={{ borderBottom: 0 }}>
                <div className="av">{iniciais(pendente.nome) || '·'}</div>
                <div>
                  <span className="quem">{pendente.nome}</span>
                  <span className="qd">
                    {tempoRelativo(pendente.criadoEmISO)}
                  </span>
                  <p className="tx">{pendente.texto}</p>
                </div>
              </div>
            </div>

            <div className="duo" style={{ marginTop: 24 }}>
              <button
                className="acao"
                type="button"
                onClick={() => setDecisao('aprovada')}
              >
                Aprovar e publicar
              </button>
              <button
                className="acao vazia"
                type="button"
                onClick={() => setDecisao('recusada')}
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

        {decisao === 'aprovada' && (
          <div className="aviso" style={{ marginTop: 24 }}>
            <b>Mensagem publicada.</b> Ela já aparece na página de{' '}
            {memorial!.nomeCompleto}. Obrigado por cuidar disso.
          </div>
        )}

        {decisao === 'recusada' && (
          <div className="aviso" style={{ marginTop: 24 }}>
            <b>Mensagem recusada.</b> Ela não será publicada e ninguém é
            avisado.
          </div>
        )}

        {import.meta.env.DEV && (
          <p className="dica" style={{ marginTop: 20, opacity: 0.4 }}>
            token: {token ?? '—'}
          </p>
        )}
      </div>
    </div>
  )
}
