/* Recuperação de senha: informa o e-mail e recebe um link para redefinir. */
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '@/lib/api'
import './admin.css'

export default function AdminRecuperar() {
  const [email, setEmail] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    document.title = 'Recuperar acesso — Painel'
  }, [])

  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    setEnviando(true)
    try {
      await api.post('/api/auth/recuperar', { email })
    } catch {
      // resposta é sempre neutra; ignoramos erros de rede aqui
    }
    setEnviado(true)
    setEnviando(false)
  }

  return (
    <div className="adm adm-login-wrap">
      <div className="adm-login">
        <div className="adm-brand">
          Painel da funerária
          <small>Recuperar acesso</small>
        </div>
        <h1>Esqueci minha senha</h1>

        {enviado ? (
          <>
            <p className="adm-sub">
              Se houver uma conta com esse e-mail, enviamos um link para
              redefinir a senha. Confira a caixa de entrada — e o spam.
            </p>
            <Link className="adm-voltar" to="/admin/login">
              ← Voltar ao login
            </Link>
          </>
        ) : (
          <>
            <p className="adm-sub">
              Informe o e-mail do painel. Enviaremos um link para você criar uma
              nova senha.
            </p>
            <form onSubmit={enviar} noValidate>
              <label>
                <span className="adm-rot">E-mail</span>
                <input
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </label>
              <button className="adm-btn adm-btn-primario" disabled={enviando}>
                {enviando ? 'Enviando…' : 'Enviar link de recuperação'}
              </button>
            </form>
            <Link className="adm-voltar" to="/admin/login">
              ← Voltar ao login
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
