/* Configurações da funerária: dados, locais padrão e modelo de mensagem do
 * WhatsApp. */
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ApiError } from '@/lib/api'
import { fetchConfig, salvarConfig, type ConfigTenant } from '../memorial/api'
import {
  TEMPLATE_WHATSAPP_PADRAO,
  VARIAVEIS_WHATSAPP,
} from '../memorial/share'
import { useSessao } from './auth'
import './admin.css'

export default function AdminConfig() {
  const navigate = useNavigate()
  const { carregando, usuario } = useSessao()
  const [cfg, setCfg] = useState<ConfigTenant | null>(null)
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    document.title = 'Configurações — Painel'
  }, [])

  useEffect(() => {
    if (!carregando && !usuario) navigate('/admin/login', { replace: true })
  }, [carregando, usuario, navigate])

  useEffect(() => {
    if (usuario) fetchConfig().then(setCfg).catch(() => setCfg(null))
  }, [usuario])

  function set<K extends keyof ConfigTenant>(k: K, v: ConfigTenant[K]) {
    setCfg((c) => (c ? { ...c, [k]: v } : c))
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    if (!cfg) return
    setSalvando(true)
    try {
      await salvarConfig(cfg)
      toast.success('Configurações salvas')
      navigate('/admin')
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Não foi possível salvar.')
      setSalvando(false)
    }
  }

  if (carregando || (usuario && !cfg)) {
    return <div className="adm adm-carregando">Carregando…</div>
  }
  if (!usuario || !cfg) return null

  return (
    <div className="adm">
      <header className="adm-top">
        <div className="adm-top-in">
          <a className="adm-marca" href="/">
            <img src="/logo.png" alt="Funerária São Francisco" />
          </a>
          <div className="adm-brand">
            Configurações
            <small>{usuario.nome}</small>
          </div>
          <Link className="adm-sair" to="/admin">
            ← Painel
          </Link>
        </div>
      </header>

      <main className="adm-main">
        <form className="adm-form-config" onSubmit={salvar}>
          <section className="adm-bloco">
            <h2>A funerária</h2>
            <div className="adm-par">
              <label>
                <span className="adm-rot">Nome</span>
                <input value={cfg.nome} onChange={(e) => set('nome', e.target.value)} required />
              </label>
              <label>
                <span className="adm-rot">Desde (ano)</span>
                <input
                  value={cfg.desde ?? ''}
                  onChange={(e) => set('desde', e.target.value || null)}
                  placeholder="Ex.: 1985"
                />
              </label>
            </div>
            <div className="adm-par">
              <label>
                <span className="adm-rot">Cidade</span>
                <input value={cfg.cidade} onChange={(e) => set('cidade', e.target.value)} required />
              </label>
              <label>
                <span className="adm-rot">UF</span>
                <input
                  value={cfg.uf}
                  maxLength={2}
                  onChange={(e) => set('uf', e.target.value.toUpperCase())}
                  required
                />
              </label>
            </div>
            <div className="adm-par">
              <label>
                <span className="adm-rot">Telefone</span>
                <input
                  value={cfg.telefone}
                  onChange={(e) => set('telefone', e.target.value)}
                  placeholder="(45) 99999-9999"
                  required
                />
              </label>
              <label>
                <span className="adm-rot">WhatsApp (DDI+DDD+número)</span>
                <input
                  value={cfg.whatsapp}
                  onChange={(e) => set('whatsapp', e.target.value)}
                  placeholder="5545999999999"
                  required
                />
                <span className="adm-dica">Só números, com 55 na frente.</span>
              </label>
            </div>
            <label>
              <span className="adm-rot">Endereço</span>
              <input
                value={cfg.endereco ?? ''}
                onChange={(e) => set('endereco', e.target.value || null)}
              />
            </label>
            <label>
              <span className="adm-rot">Sobre (texto da home)</span>
              <textarea
                value={cfg.sobre ?? ''}
                onChange={(e) => set('sobre', e.target.value || null)}
                rows={3}
              />
            </label>
          </section>

          <section className="adm-bloco">
            <h2>Locais padrão</h2>
            <p className="adm-sub">
              Preenchidos automaticamente ao criar uma nova nota (dá para editar
              em cada memorial).
            </p>
            <label>
              <span className="adm-rot">Velório — local padrão</span>
              <input
                value={cfg.velorioLocalPadrao ?? ''}
                onChange={(e) => set('velorioLocalPadrao', e.target.value || null)}
                placeholder="Ex.: Capela Memorial São Francisco"
              />
            </label>
            <label>
              <span className="adm-rot">Velório — endereço padrão</span>
              <input
                value={cfg.velorioEnderecoPadrao ?? ''}
                onChange={(e) => set('velorioEnderecoPadrao', e.target.value || null)}
              />
            </label>
            <label>
              <span className="adm-rot">Sepultamento — local padrão</span>
              <input
                value={cfg.sepultamentoLocalPadrao ?? ''}
                onChange={(e) => set('sepultamentoLocalPadrao', e.target.value || null)}
                placeholder="Ex.: Cemitério Municipal de Catanduvas"
              />
            </label>
          </section>

          <section className="adm-bloco">
            <h2>Mensagem do WhatsApp</h2>
            <p className="adm-sub">
              Texto que acompanha o link ao compartilhar uma nota. Variáveis:{' '}
              {VARIAVEIS_WHATSAPP.map((v) => (
                <code key={v} className="adm-var">
                  {v}
                </code>
              ))}
            </p>
            <label>
              <textarea
                value={cfg.whatsappTemplate ?? ''}
                onChange={(e) => set('whatsappTemplate', e.target.value || null)}
                rows={5}
                placeholder={TEMPLATE_WHATSAPP_PADRAO}
              />
              <span className="adm-dica">
                Em branco = usa o modelo padrão do sistema.
              </span>
            </label>
          </section>

          <button className="adm-btn adm-btn-primario" disabled={salvando}>
            {salvando ? 'Salvando…' : 'Salvar configurações'}
          </button>
        </form>
      </main>
    </div>
  )
}
