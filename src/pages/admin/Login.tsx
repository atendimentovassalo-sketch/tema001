/* Login do admin da funerária + 1º acesso (definir senha via ?convite=token). */
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { api, ApiError } from '@/lib/api'
import { useSessao } from './auth'
import './admin.css'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const convite = params.get('convite')
  const primeiroAcesso = !!convite

  const { carregando, usuario } = useSessao()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    document.title = 'Acesso — Painel da funerária'
  }, [])

  // já logado: vai para o painel
  useEffect(() => {
    if (!carregando && usuario) navigate('/admin', { replace: true })
  }, [carregando, usuario, navigate])

  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    setErro(null)
    setEnviando(true)
    try {
      if (primeiroAcesso) {
        await api.post('/api/auth/definir-senha', { token: convite, senha })
      } else {
        await api.post('/api/auth/login', { email, senha })
      }
      navigate('/admin', { replace: true })
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Não foi possível entrar.')
      setEnviando(false)
    }
  }

  return (
    <div className="adm adm-login-wrap">
      <div className="adm-login">
        <div className="adm-brand">
          Painel da funerária
          <small>Área restrita</small>
        </div>
        <h1>{primeiroAcesso ? 'Defina sua senha' : 'Entrar'}</h1>
        <p className="adm-sub">
          {primeiroAcesso
            ? 'Este é o seu primeiro acesso. Escolha uma senha para proteger o painel.'
            : 'Acesse para publicar notas e gerenciar homenagens.'}
        </p>

        <form onSubmit={enviar} noValidate>
          {!primeiroAcesso && (
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
          )}
          <label>
            <span className="adm-rot">Senha</span>
            <input
              type="password"
              autoComplete={primeiroAcesso ? 'new-password' : 'current-password'}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              minLength={primeiroAcesso ? 8 : undefined}
              required
            />
            {primeiroAcesso && (
              <span className="adm-dica">Ao menos 8 caracteres.</span>
            )}
          </label>

          {erro && <p className="adm-erro">{erro}</p>}

          <button className="adm-btn adm-btn-primario" disabled={enviando}>
            {enviando ? 'Aguarde…' : primeiroAcesso ? 'Definir senha e entrar' : 'Entrar'}
          </button>
        </form>

        <Link className="adm-voltar" to="/funeraria">
          ← Voltar ao site
        </Link>
      </div>
    </div>
  )
}
