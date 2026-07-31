/* Prévia da nova nota: renderiza a página EXATA a partir do rascunho do formulário,
 * com a barra "Confirmar e publicar / Corrigir". A regra do produto: o dono vê a
 * página real antes de publicar. */
import { Link } from 'react-router-dom'
import MemorialPage from './MemorialPage'
import { loadDraft } from './draft'
import './memorial.css'

export default function PreviewMemorial() {
  const draft = loadDraft()

  if (!draft) {
    return (
      <div className="memorial-root">
        <div className="form" style={{ paddingTop: 80 }}>
          <h2 style={{ fontSize: '1.8rem' }}>
            Nenhum rascunho para pré-visualizar
          </h2>
          <p style={{ marginTop: 12 }}>
            Preencha os dados primeiro.{' '}
            <Link to="/memorial/novo" style={{ color: 'var(--brass-e)' }}>
              Ir para o formulário
            </Link>
            .
          </p>
        </div>
      </div>
    )
  }

  return <MemorialPage memorialOverride={draft} preview />
}
