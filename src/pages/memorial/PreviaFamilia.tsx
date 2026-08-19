/* A nota como ela vai ao ar, para quem tem o link da família.
 *
 * POR QUE (18/08/2026): quem escreve a história e sobe as fotos precisa VER a
 * página antes de ela existir para os outros. Até aqui a área da família
 * oferecia "ver como as pessoas veem", mas o link ia para /m/:slug — que só
 * serve memorial publicado. Em rascunho, dava "não encontrado" justamente para
 * quem estava preenchendo.
 *
 * Reaproveita a página real (`MemorialPage`) com os dados vindos do endpoint do
 * token: o que a família vê aqui é a página, não uma representação dela.
 */
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import MemorialPage from './MemorialPage'
import { api, ApiError } from '@/lib/api'
import type { Memorial } from './types'
import './previa-familia.css'

export default function PreviaFamilia() {
  const { token = '' } = useParams()
  const [memorial, setMemorial] = useState<Memorial | null>(null)
  const [publicado, setPublicado] = useState(false)
  const [nome, setNome] = useState('')
  const [parentesco, setParentesco] = useState('')
  const [aprovando, setAprovando] = useState(false)
  const [aprovado, setAprovado] = useState<string | null>(null)
  const [erroAprovar, setErroAprovar] = useState<string | null>(null)
  const [estado, setEstado] = useState<'carregando' | 'ok' | 'invalido'>(
    'carregando',
  )

  useEffect(() => {
    let vivo = true
    api
      .get<{ memorial: Memorial; publicado: boolean }>(
        `/api/familia/${encodeURIComponent(token)}/previa`,
      )
      .then((r) => {
        if (!vivo) return
        setMemorial(r.memorial)
        setPublicado(r.publicado)
        setEstado('ok')
      })
      .catch(() => {
        if (vivo) setEstado('invalido')
      })
    return () => {
      vivo = false
    }
  }, [token])

  if (estado === 'carregando')
    return <div className="fam fam-centro">Carregando a prévia…</div>

  if (estado === 'invalido' || !memorial)
    return (
      <div className="fam fam-centro">
        <div className="fam-caixa">
          <h1>Link indisponível</h1>
          <p>Este link não é mais válido — ele vale por 30 dias.</p>
          <p className="fam-dica">
            Peça um link novo à funerária que fez o atendimento.
          </p>
        </div>
      </div>
    )

  async function aprovar() {
    if (!nome.trim()) {
      setErroAprovar('Escreva seu nome para liberar a publicação.')
      return
    }
    setAprovando(true)
    setErroAprovar(null)
    try {
      const r = await api.post<{ ok: true; autorizadoPor: string }>(
        `/api/familia/${encodeURIComponent(token)}/aprovar`,
        { nome: nome.trim(), parentesco: parentesco.trim() },
      )
      setAprovado(r.autorizadoPor)
      setPublicado(true)
    } catch (e) {
      setErroAprovar(
        e instanceof ApiError ? e.message : 'Não deu para aprovar agora.',
      )
    } finally {
      setAprovando(false)
    }
  }

  /* A barra fica NO FIM da página, não fixa no rodapé: o pedido do Felipe é
   * "visualizar e DEPOIS aprovar". Botão flutuando desde o topo deixa aprovar
   * sem ter rolado — que é exatamente o que se quer evitar. */
  const barraAprovar = aprovado ? (
    <div className="apf apf--ok" role="status">
      <h2>A nota está no ar</h2>
      <p>
        Liberada por <b>{aprovado}</b>.
      </p>
      <p>
        Qualquer pessoa com o endereço já consegue abrir e deixar uma homenagem.
      </p>
      <a className="apf-btn" href={`/m/${memorial.slug}`}>
        Abrir a página publicada
      </a>
      <p className="apf-nota">
        Ainda dá para acrescentar fotos e mexer na história pelo mesmo link da
        família — a página muda junto.
      </p>
    </div>
  ) : publicado ? (
    <div className="apf" role="status">
      <h2>Esta página já está no ar</h2>
      <p>É assim que ela aparece para quem recebe o endereço.</p>
      <p>Não precisa aprovar de novo.</p>
      <p className="apf-nota">
        Para acrescentar foto ou mexer na história,{' '}
        <Link to={`/memorial/familia/${encodeURIComponent(token)}`}>
          volte para a edição
        </Link>
        . A página muda junto.
      </p>
    </div>
  ) : (
    <div className="apf">
      <h2>Está tudo certo?</h2>
      <p>Se a página acima está como deveria, é só liberar.</p>
      <p>Ela vai ao ar na hora, e a funerária é avisada.</p>
      <p>
        Se ainda faltar alguma coisa,{' '}
        <Link to={`/memorial/familia/${encodeURIComponent(token)}`}>
          volte e continue editando
        </Link>
        .
      </p>
      <div className="apf-campos">
        <label>
          Seu nome
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            maxLength={90}
            autoComplete="name"
            placeholder="Como você quer assinar"
          />
        </label>
        <label>
          Parentesco <span className="apf-op">(opcional)</span>
          <input
            value={parentesco}
            onChange={(e) => setParentesco(e.target.value)}
            maxLength={60}
            placeholder="filha, neto, sobrinha…"
          />
        </label>
      </div>
      <p className="apf-nota">
        Fica escrito no rodapé da página: “Publicação autorizada por…”. É o
        registro de que a família autorizou.
      </p>
      {erroAprovar && <p className="apf-erro">{erroAprovar}</p>}
      <button className="apf-btn" onClick={aprovar} disabled={aprovando}>
        {aprovando ? 'Publicando…' : 'Aprovar e publicar'}
      </button>
    </div>
  )

  return (
    <MemorialPage
      memorialOverride={memorial}
      rodape={barraAprovar}
      faixa={
        <div className="mv3-previa-faixa" role="status">
          <strong>Prévia</strong> —{' '}
          {publicado
            ? 'é assim que a página está para quem visita.'
            : 'esta página ainda não está no ar. Só quem tem o link da família a enxerga.'}{' '}
          <Link to={`/memorial/familia/${encodeURIComponent(token)}`}>
            Voltar e continuar editando
          </Link>
        </div>
      }
    />
  )
}
