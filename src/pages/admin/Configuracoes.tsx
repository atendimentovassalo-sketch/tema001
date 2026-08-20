/* Configurações da funerária: dados, locais padrão e modelo de mensagem do
 * WhatsApp. */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ApiError } from '@/lib/api'
import {
  fetchConfig,
  salvarConfig,
  uploadFoto,
  type ConfigTenant,
} from '../memorial/api'
import { TEMPLATE_WHATSAPP_PADRAO, VARIAVEIS_WHATSAPP } from '../memorial/share'
import { useSessao } from './auth'
import PainelShell from './PainelShell'
import './admin.css'

export default function AdminConfig() {
  const navigate = useNavigate()
  const { carregando, usuario } = useSessao()
  const [cfg, setCfg] = useState<ConfigTenant | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [subindoLogo, setSubindoLogo] = useState(false)

  useEffect(() => {
    document.title = 'Configurações — Painel'
  }, [])

  useEffect(() => {
    if (!carregando && !usuario) navigate('/admin/login', { replace: true })
  }, [carregando, usuario, navigate])

  useEffect(() => {
    if (usuario)
      fetchConfig()
        .then(({ config }) => setCfg(config))
        .catch(() => setCfg(null))
  }, [usuario])

  function set<K extends keyof ConfigTenant>(k: K, v: ConfigTenant[K]) {
    setCfg((c) => (c ? { ...c, [k]: v } : c))
  }

  /* A logo reaproveita o mesmo upload das fotos de memorial: mesma checagem de
     assinatura binária no servidor, mesmo R2. O que muda é onde o caminho é
     guardado — aqui ele só entra no formulário, e vale quando salvar. */
  async function enviarLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0]
    e.target.value = ''
    if (!arquivo) return
    setSubindoLogo(true)
    try {
      set('logoUrl', await uploadFoto(arquivo))
      toast.success('Logo enviada — salve para aplicar')
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : 'Não foi possível enviar.',
      )
    } finally {
      setSubindoLogo(false)
    }
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
      toast.error(
        err instanceof ApiError ? err.message : 'Não foi possível salvar.',
      )
      setSalvando(false)
    }
  }

  if (carregando || (usuario && !cfg)) {
    return <div className="adm adm-carregando">Carregando…</div>
  }
  if (!usuario || !cfg) return null

  return (
    <PainelShell usuario={usuario} titulo="Configurações">
      <>
        <form className="adm-form-config" onSubmit={salvar}>
          <section className="adm-bloco">
            <h2>Financeiro</h2>
            <p className="adm-sub">
              Em que dia começa o seu mês financeiro. Quem recebe as
              mensalidades no dia 10 costuma pensar o mês de 10 a 9 — o painel
              passa a abrir nesse mês, e não no do calendário.
            </p>
            <label className="ges-campo" style={{ maxWidth: 220 }}>
              <span>Dia de início do ciclo</span>
              <select
                value={String(cfg.diaInicioCiclo ?? 1)}
                onChange={(e) => set('diaInicioCiclo', Number(e.target.value))}
              >
                <option value="1">Dia 1 (mês do calendário)</option>
                {Array.from({ length: 27 }, (_, i) => i + 2).map((d) => (
                  <option key={d} value={d}>
                    Dia {d}
                  </option>
                ))}
              </select>
            </label>
            <p className="adm-dica">
              Vale também como dia de vencimento sugerido ao cadastrar um plano
              novo. Não muda nada do que já está lançado — trocar depois é
              seguro. Vai até 28 por causa de fevereiro.
            </p>
          </section>

          <section className="adm-bloco">
            <h2>A funerária</h2>
            <div className="adm-par">
              <label>
                <span className="adm-rot">Nome</span>
                <input
                  value={cfg.nome}
                  onChange={(e) => set('nome', e.target.value)}
                  required
                />
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
                <input
                  value={cfg.cidade}
                  onChange={(e) => set('cidade', e.target.value)}
                  required
                />
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
            <h2>Identidade jurídica e marca</h2>
            <p className="adm-sub">
              Isto aqui não é enfeite de cadastro: são os dados que a{' '}
              <a href="/privacidade" target="_blank" rel="noopener">
                Política de Privacidade
              </a>{' '}
              e os{' '}
              <a href="/termos" target="_blank" rel="noopener">
                Termos de Uso
              </a>{' '}
              publicam no seu site. Campo em branco sai da frase — nada é
              inventado, e nada aparece como lacuna.
            </p>

            <label>
              <span className="adm-rot">Logo</span>
              <div className="adm-logo-campo">
                {cfg.logoUrl ? (
                  <img className="adm-logo-previa" src={cfg.logoUrl} alt="" />
                ) : (
                  <span className="adm-logo-previa adm-marca-texto">
                    {cfg.nome}
                  </span>
                )}
                <div>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={enviarLogo}
                    disabled={subindoLogo}
                  />
                  {cfg.logoUrl && (
                    <button
                      type="button"
                      className="adm-link"
                      onClick={() => set('logoUrl', null)}
                    >
                      Remover a logo
                    </button>
                  )}
                  <span className="adm-dica">
                    PNG com fundo transparente funciona melhor: a logo é
                    exibida sobre uma placa escura. Sem logo, o painel mostra o
                    nome da funerária.
                  </span>
                </div>
              </div>
            </label>

            <div className="adm-par">
              <label>
                <span className="adm-rot">E-mail público</span>
                <input
                  type="email"
                  value={cfg.email ?? ''}
                  onChange={(e) => set('email', e.target.value || null)}
                  placeholder="atendimento@suafuneraria.com.br"
                />
                <span className="adm-dica">Aparece no rodapé do site.</span>
              </label>
              <label>
                <span className="adm-rot">E-mail do Encarregado (LGPD)</span>
                <input
                  type="email"
                  value={cfg.dpoEmail ?? ''}
                  onChange={(e) => set('dpoEmail', e.target.value || null)}
                  placeholder="Se vazio, usa o e-mail público"
                />
                <span className="adm-dica">
                  Quem responde pedidos de acesso e remoção de dados.
                </span>
              </label>
            </div>

            <div className="adm-par">
              <label>
                <span className="adm-rot">Razão social</span>
                <input
                  value={cfg.razaoSocial ?? ''}
                  onChange={(e) => set('razaoSocial', e.target.value || null)}
                  placeholder="Ex.: Fulano & Beltrano Ltda"
                />
              </label>
              <label>
                <span className="adm-rot">CNPJ</span>
                <input
                  value={cfg.cnpj ?? ''}
                  onChange={(e) => set('cnpj', e.target.value || null)}
                  placeholder="00.000.000/0001-00"
                />
              </label>
            </div>

            <div className="adm-par">
              <label>
                <span className="adm-rot">Alvará</span>
                <input
                  value={cfg.alvara ?? ''}
                  onChange={(e) => set('alvara', e.target.value || null)}
                  placeholder="Ex.: Alvará nº 105, de 1989"
                />
                <span className="adm-dica">Só aparece no rodapé.</span>
              </label>
              <label>
                <span className="adm-rot">Comarca do foro</span>
                <input
                  value={cfg.foroComarca ?? ''}
                  onChange={(e) => set('foroComarca', e.target.value || null)}
                  placeholder="Ex.: Catanduvas, Estado do Paraná"
                />
                <span className="adm-dica">
                  Em branco, os Termos não elegem foro — e vale a regra geral da
                  lei, que já protege o consumidor. Melhor vazio do que errado.
                </span>
              </label>
            </div>
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
                onChange={(e) =>
                  set('velorioLocalPadrao', e.target.value || null)
                }
                placeholder="Ex.: Capela Memorial São Francisco"
              />
            </label>
            <label>
              <span className="adm-rot">Velório — endereço padrão</span>
              <input
                value={cfg.velorioEnderecoPadrao ?? ''}
                onChange={(e) =>
                  set('velorioEnderecoPadrao', e.target.value || null)
                }
              />
            </label>
            <label>
              <span className="adm-rot">Sepultamento — local padrão</span>
              <input
                value={cfg.sepultamentoLocalPadrao ?? ''}
                onChange={(e) =>
                  set('sepultamentoLocalPadrao', e.target.value || null)
                }
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
                onChange={(e) =>
                  set('whatsappTemplate', e.target.value || null)
                }
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
      </>
    </PainelShell>
  )
}
