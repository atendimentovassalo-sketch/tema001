/* O bloco de identificação que abre a Política de Privacidade e os Termos:
 * quem responde, sob qual CNPJ, em que endereço, por quais contatos.
 *
 * Linha a linha, e cada linha só aparece se houver o que dizer. Uma funerária
 * que ainda não cadastrou o CNPJ mostra nome, endereço e contatos — e não uma
 * linha "CNPJ" vazia, que num documento jurídico lê como erro de sistema. */
import type { Funeraria } from '../memorial/types'

export default function BlocoIdentidade({ f }: { f: Funeraria | null }) {
  if (!f) {
    return (
      <p className="legal-identidade">A funerária responsável por este site.</p>
    )
  }
  /* "Razão social — nome fantasia X" só faz sentido quando as duas existem;
     com uma só, repetir a fórmula soaria a formulário mal preenchido. */
  const cabeca = f.razaoSocial
    ? `${f.razaoSocial} — nome fantasia ${f.nome}`
    : f.nome
  const registro = [f.cnpj && `CNPJ ${f.cnpj}`, f.alvara]
    .filter(Boolean)
    .join(' · ')
  const email = f.dpoEmail ?? f.email

  return (
    <p className="legal-identidade">
      <b>{cabeca}</b>
      {registro && (
        <>
          <br />
          {registro}
        </>
      )}
      {f.endereco && (
        <>
          <br />
          {f.endereco}
        </>
      )}
      {(email || f.telefone) && (
        <>
          <br />
          {email && <a href={`mailto:${email}`}>{email}</a>}
          {email && f.telefone && ' · '}
          {f.telefone && <a href={`tel:+${f.whatsapp}`}>{f.telefone}</a>}
        </>
      )}
    </p>
  )
}
