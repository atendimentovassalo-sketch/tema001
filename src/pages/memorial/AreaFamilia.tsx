/* Área da família — acesso por link com token, sem senha e sem cadastro.
 *
 * Decidido em 12/08/2026, construído em 18/08/2026. Quem abre esta página
 * acabou de perder alguém e está no celular, provavelmente no velório. Isso
 * dita tudo aqui: nada de login, nada de "salvar" escondido no fim de um
 * formulário longo, nenhuma ação destrutiva sem volta, e texto que não cobra
 * nada de quem chegou.
 *
 * O que a família pode: escrever a história, subir e apagar fotos, e ocultar
 * uma homenagem. Ocultar não apaga — dá para reexibir.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api, ApiError } from '@/lib/api'
import './familia.css'

interface Homenagem {
  id: string
  nome: string
  texto: string | null
  vela: boolean
  oculta: boolean
}
interface Foto {
  id: string
  url: string
}
interface Dados {
  memorial: { nomeCompleto: string; slug: string; historia: string | null }
  homenagens: Homenagem[]
  fotos: Foto[]
  maxFotos: number
  expiraEm: string
}

export default function AreaFamilia() {
  const { token = '' } = useParams()
  const [dados, setDados] = useState<Dados | null>(null)
  const [estado, setEstado] = useState<'carregando' | 'ok' | 'invalido'>(
    'carregando',
  )
  const [historia, setHistoria] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [salvo, setSalvo] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [aviso, setAviso] = useState<string | null>(null)
  const arquivoRef = useRef<HTMLInputElement>(null)

  const carregar = useCallback(async () => {
    try {
      const d = await api.get<Dados>(
        `/api/familia/${encodeURIComponent(token)}`,
      )
      setDados(d)
      setHistoria(d.memorial.historia ?? '')
      setEstado('ok')
      document.title = `${d.memorial.nomeCompleto} — área da família`
    } catch {
      setEstado('invalido')
    }
  }, [token])

  useEffect(() => {
    carregar()
  }, [carregar])

  async function salvarHistoria() {
    setSalvando(true)
    setAviso(null)
    try {
      await api.put(`/api/familia/${encodeURIComponent(token)}`, {
        historia: historia.trim() || null,
      })
      setSalvo(true)
      /* Confirmação some sozinha: aviso permanente vira ruído na tela. */
      setTimeout(() => setSalvo(false), 4000)
    } catch (e) {
      setAviso(e instanceof ApiError ? e.message : 'Não deu para salvar agora.')
    } finally {
      setSalvando(false)
    }
  }

  async function enviarFoto(arquivo: File) {
    setEnviando(true)
    setAviso(null)
    try {
      await fetch(`/api/familia/${encodeURIComponent(token)}/foto`, {
        method: 'POST',
        headers: { 'content-type': arquivo.type || 'application/octet-stream' },
        body: arquivo,
      }).then(async (r) => {
        if (!r.ok) {
          const c = await r.json().catch(() => null)
          throw new Error(c?.erro ?? 'Não deu para enviar a foto.')
        }
      })
      await carregar()
    } catch (e) {
      setAviso(e instanceof Error ? e.message : 'Não deu para enviar a foto.')
    } finally {
      setEnviando(false)
      if (arquivoRef.current) arquivoRef.current.value = ''
    }
  }

  async function apagarFoto(f: Foto) {
    if (!confirm('Apagar esta foto da galeria?')) return
    try {
      await api.del(`/api/familia/${encodeURIComponent(token)}/foto?id=${f.id}`)
      await carregar()
    } catch {
      setAviso('Não deu para apagar a foto.')
    }
  }

  async function alternarHomenagem(h: Homenagem) {
    try {
      await api.post(`/api/familia/${encodeURIComponent(token)}/homenagem`, {
        id: h.id,
        ocultar: !h.oculta,
      })
      await carregar()
    } catch {
      setAviso('Não deu para atualizar agora.')
    }
  }

  if (estado === 'carregando')
    return <div className="fam fam-centro">Carregando…</div>

  if (estado === 'invalido' || !dados)
    return (
      <div className="fam fam-centro">
        <div className="fam-caixa">
          <h1>Link indisponível</h1>
          <p>
            Este link não é mais válido — ele vale por 30 dias a partir do
            envio.
          </p>
          <p className="fam-dica">
            Peça um link novo à funerária que fez o atendimento. Nada do que já
            foi escrito se perdeu.
          </p>
        </div>
      </div>
    )

  const { memorial, homenagens, fotos, maxFotos } = dados
  /* O mesmo componente responde em /memorial/familia/:token e em
   * /familia/:token (ver App.tsx); a prévia tem de continuar no caminho por
   * onde a pessoa entrou, senão cai fora da rota do Worker no domínio da
   * funerária. */
  const urlBase = location.pathname.replace(/\/$/, '')
  const podeSubir = fotos.length < maxFotos

  return (
    <div className="fam">
      <header className="fam-topo">
        <p className="fam-cap">Área da família</p>
        <h1>{memorial.nomeCompleto}</h1>
        <p className="fam-sub">
          Aqui você acrescenta as fotos, escreve a história e escolhe o que
          aparece na página. No fim dá para ver como ficou. Só você e a
          funerária têm este link.
        </p>
      </header>

      {aviso && <p className="fam-aviso">{aviso}</p>}

      <section className="fam-bloco">
        <h2>Fotos</h2>
        <p className="fam-dica">
          Até {maxFotos} fotos. Elas aparecem na página para quem visitar.
        </p>

        {fotos.length > 0 && (
          <ul className="fam-galeria">
            {fotos.map((f) => (
              <li key={f.id}>
                <img src={f.url} alt="" loading="lazy" />
                <button onClick={() => apagarFoto(f)} aria-label="Apagar foto">
                  Apagar
                </button>
              </li>
            ))}
          </ul>
        )}

        {podeSubir ? (
          <>
            <input
              ref={arquivoRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) enviarFoto(f)
              }}
              disabled={enviando}
            />
            {enviando && <p className="fam-dica">Enviando…</p>}
          </>
        ) : (
          <p className="fam-dica">
            A galeria está cheia. Apague alguma foto para incluir outra.
          </p>
        )}
      </section>

      <section className="fam-bloco">
        <h2>A história</h2>
        <p className="fam-dica">
          Do jeito que vier. Uma lembrança, o que a pessoa gostava de fazer, uma
          frase que ela repetia. Se preferir deixar em branco, tudo bem também.
        </p>
        <textarea
          value={historia}
          onChange={(e) => setHistoria(e.target.value)}
          rows={9}
          maxLength={8000}
          placeholder="Escreva aqui…"
        />
        <div className="fam-acoes">
          <button
            className="fam-btn"
            onClick={salvarHistoria}
            disabled={salvando}
          >
            {salvando ? 'Salvando…' : 'Salvar'}
          </button>
          {salvo && <span className="fam-ok">Salvo.</span>}
        </div>
      </section>

      {homenagens.length > 0 && (
        <section className="fam-bloco">
          <h2>Homenagens recebidas</h2>
          <p className="fam-dica">
            Se alguma mensagem incomodar, você pode escondê-la da página. Ela
            não é apagada — dá para mostrar de novo quando quiser.
          </p>
          <ul className="fam-homenagens">
            {homenagens.map((h) => (
              <li key={h.id} className={h.oculta ? 'fam-oculta' : undefined}>
                <div>
                  <strong>{h.nome}</strong>
                  <p>{h.texto ?? (h.vela ? 'Acendeu uma vela' : '—')}</p>
                  {h.oculta && (
                    <span className="fam-marca">escondida da página</span>
                  )}
                </div>
                <button onClick={() => alternarHomenagem(h)}>
                  {h.oculta ? 'Mostrar' : 'Esconder'}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="fam-bloco fam-final">
        <h2>Ver como ficou</h2>
        <p className="fam-dica">
          A página abre exatamente como as pessoas vão vê-la — com as fotos e a
          história que você acabou de escrever. Dá para voltar e mudar o que
          quiser depois de olhar.
        </p>
        <a className="fam-btn fam-btn--ver" href={`${urlBase}/previa`}>
          Ver a prévia da página
        </a>
      </section>

      <p className="fam-rodape">
        Qualquer coisa que você queira mudar e não encontre aqui — uma data, o
        nome, o horário — é só falar com a funerária.
      </p>
    </div>
  )
}
