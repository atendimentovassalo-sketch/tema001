/* Prévia da nota, ao lado do formulário, preenchendo conforme se digita.
 *
 * Por que isto existe: quem preenche está com a família na frente, e o que ela
 * quer conferir não é o formulário — é a página. Antes era preciso salvar como
 * rascunho, abrir noutra aba e voltar. Agora o erro de digitação no nome aparece
 * enquanto ainda se está no campo.
 *
 * NÃO é a página real: é uma representação fiel do essencial (retrato, nome,
 * datas, velório, epitáfio). Prometer que é idêntica seria mentira, e o rodapé
 * diz isso — o botão "salvar rascunho e ver a página" continua sendo a
 * conferência de verdade.
 *
 * Campo vazio some, não vira "—" nem mostra o nome do campo: a prévia tem de
 * parecer com o que vai ao ar, e o que está em branco simplesmente não sai.
 */
import { ddmm } from './format'

export interface DadosPrevia {
  nomeCompleto?: string
  apelido?: string
  nascimento?: string
  falecimento?: string
  cidadeNascimento?: string
  cidadeFalecimento?: string
  epitafio?: string
  historia?: string
  velorioLocal?: string
  velorioEndereco?: string
  velorioInicio?: string
  sepLocal?: string
  sepInicio?: string
  fotoUrl?: string | null
}

/** 'AAAA-MM-DDTHH:mm' -> '06/08 às 19h30'. Devolve null se não der para ler. */
function quando(iso?: string): string | null {
  if (!iso) return null
  const [data, hora] = iso.split('T')
  const dm = ddmm(data)
  if (!dm) return null
  if (!hora) return dm
  const [h, min] = hora.split(':')
  return `${dm} às ${h}h${min && min !== '00' ? min : ''}`
}

/** Só o ANO no nascimento — decisão de 12/08: nome completo mais data exata de
 *  nascimento é vetor de fraude. Vale na tela e no JSON-LD; vale aqui também. */
function anos(nascimento?: string, falecimento?: string): string | null {
  const a = nascimento?.slice(0, 4)
  const b = falecimento?.slice(0, 4)
  if (a && b) return `${a} — ${b}`
  if (b) return b
  if (a) return a
  return null
}

export default function PreviaMemorial({ d }: { d: DadosPrevia }) {
  const nome = d.nomeCompleto?.trim()
  const periodo = anos(d.nascimento, d.falecimento)
  const velorio = quando(d.velorioInicio)
  const sep = quando(d.sepInicio)
  const vazia = !nome && !d.fotoUrl && !periodo

  return (
    <aside className="prv" aria-label="Prévia da página">
      <p className="prv-rot">Prévia da página</p>

      <div className="prv-folha">
        {vazia ? (
          <p className="prv-vazia">
            A página vai aparecendo aqui conforme você preenche.
          </p>
        ) : (
          <>
            {d.fotoUrl && <img className="prv-foto" src={d.fotoUrl} alt="" />}

            {nome && <h2 className="prv-nome">{nome}</h2>}
            {d.apelido?.trim() && (
              <p className="prv-apelido">{d.apelido.trim()}</p>
            )}
            {periodo && <p className="prv-anos">{periodo}</p>}

            {d.epitafio?.trim() && (
              <p className="prv-epitafio">“{d.epitafio.trim()}”</p>
            )}

            {(d.velorioLocal?.trim() ||
              velorio ||
              d.sepLocal?.trim() ||
              sep) && (
              <div className="prv-bloco">
                {(d.velorioLocal?.trim() || velorio) && (
                  <p>
                    <strong>Velório</strong>
                    {d.velorioLocal?.trim()
                      ? ` · ${d.velorioLocal.trim()}`
                      : ''}
                    {velorio ? ` · ${velorio}` : ''}
                    {d.velorioEndereco?.trim() && (
                      <span className="prv-end">
                        {d.velorioEndereco.trim()}
                      </span>
                    )}
                  </p>
                )}
                {(d.sepLocal?.trim() || sep) && (
                  <p>
                    <strong>Sepultamento</strong>
                    {d.sepLocal?.trim() ? ` · ${d.sepLocal.trim()}` : ''}
                    {sep ? ` · ${sep}` : ''}
                  </p>
                )}
              </div>
            )}

            {d.historia?.trim() && (
              <p className="prv-historia">{d.historia.trim()}</p>
            )}
          </>
        )}
      </div>

      <p className="prv-nota">
        Representação do essencial, não a página final. Para conferir de
        verdade, salve como rascunho e abra a página.
      </p>
    </aside>
  )
}
