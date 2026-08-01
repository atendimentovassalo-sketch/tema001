/* Política de Privacidade (LGPD). Os campos entre destaque são preenchidos
 * pela funerária antes de ir ao ar (razão social, CNPJ, contato do DPO). */
import LegalLayout from './LegalLayout'

const PH = ({ children }: { children: string }) => (
  <span className="legal-ph">{children}</span>
)

export default function Privacidade() {
  return (
    <LegalLayout titulo="Política de Privacidade" atualizadoEm="agosto de 2026">
      <p>
        Esta Política explica como tratamos dados pessoais neste site de
        memorial e obituário, em conformidade com a Lei nº 13.709/2018 (Lei
        Geral de Proteção de Dados — LGPD). Ao usar o site, você toma
        conhecimento das práticas aqui descritas.
      </p>

      <h2>
        <span className="legal-n">1.</span> Quem é o controlador
      </h2>
      <p>
        O controlador dos dados é <PH>[RAZÃO SOCIAL DA FUNERÁRIA]</PH>, inscrita
        no CNPJ sob nº <PH>[CNPJ]</PH>, com sede em <PH>[ENDEREÇO COMPLETO]</PH>.
        Para assuntos de privacidade, fale com o Encarregado (DPO) pelo e-mail{' '}
        <PH>[E-MAIL DO DPO]</PH>.
      </p>

      <h2>
        <span className="legal-n">2.</span> Quais dados tratamos
      </h2>
      <ul>
        <li>
          <b>Da pessoa homenageada:</b> nome, foto, datas e locais de
          nascimento e falecimento, texto biográfico e informações do velório e
          sepultamento — publicados pela funerária mediante autorização da
          família.
        </li>
        <li>
          <b>De quem deixa homenagens:</b> o nome informado e a mensagem
          escrita, que ficam visíveis na página. O envio é voluntário.
        </li>
        <li>
          <b>Do responsável pela família:</b> quando há moderação de mensagens,
          um contato (ex.: WhatsApp) para aprovar homenagens.
        </li>
        <li>
          <b>Dados técnicos mínimos:</b> registros de acesso e um identificador
          técnico derivado do endereço IP (armazenado apenas de forma
          embaralhada), usados para segurança e para conter abuso/spam.
        </li>
      </ul>
      <p className="legal-nota">
        A LGPD protege pessoas naturais vivas. Dados da pessoa falecida são
        publicados sob responsabilidade e autorização da família; ainda assim,
        tratamos com respeito e removemos informações a pedido de quem tenha
        legitimidade.
      </p>

      <h2>
        <span className="legal-n">3.</span> Para que usamos
      </h2>
      <ul>
        <li>Publicar a nota de falecimento e permitir homenagens.</li>
        <li>Moderar mensagens quando a família solicita.</li>
        <li>Garantir a segurança do site e prevenir abuso.</li>
        <li>Cumprir obrigações legais e responder solicitações.</li>
      </ul>

      <h2>
        <span className="legal-n">4.</span> Base legal
      </h2>
      <p>
        Tratamos dados com fundamento no consentimento (de quem envia
        homenagem), no legítimo interesse (funcionamento e segurança do
        serviço), na autorização da família para a publicação da nota, e no
        cumprimento de obrigações legais.
      </p>

      <h2>
        <span className="legal-n">5.</span> Compartilhamento
      </h2>
      <p>
        Não vendemos dados. Utilizamos a infraestrutura da Cloudflare, Inc. para
        hospedagem, banco de dados e armazenamento de imagens, que atua como
        operadora sob nossas instruções. Podemos divulgar dados quando exigido
        por lei ou ordem judicial.
      </p>

      <h2>
        <span className="legal-n">6.</span> Armazenamento e segurança
      </h2>
      <p>
        Adotamos medidas técnicas e organizacionais para proteger os dados
        (conexão criptografada, controle de acesso ao painel e senhas com
        derivação criptográfica). Nenhum sistema é totalmente imune, mas
        trabalhamos para reduzir riscos.
      </p>

      <h2>
        <span className="legal-n">7.</span> Por quanto tempo guardamos
      </h2>
      <p>
        As notas de falecimento e homenagens permanecem publicadas enquanto a
        página existir, por sua função de memória. A qualquer momento a família
        pode solicitar a remoção. Dados técnicos de segurança são mantidos pelo
        tempo necessário à sua finalidade.
      </p>

      <h2>
        <span className="legal-n">8.</span> Seus direitos
      </h2>
      <p>
        Nos termos da LGPD, você pode solicitar confirmação de tratamento,
        acesso, correção, anonimização, portabilidade, informação sobre
        compartilhamento e a exclusão de dados tratados com base no
        consentimento, além de revogar o consentimento. Para exercer, escreva
        para <PH>[E-MAIL DO DPO]</PH>.
      </p>

      <h2>
        <span className="legal-n">9.</span> Cookies
      </h2>
      <p>
        O site usa apenas um cookie técnico de sessão, necessário para o acesso
        da funerária ao painel administrativo. Não usamos cookies de
        publicidade nem rastreamento de terceiros.
      </p>

      <h2>
        <span className="legal-n">10.</span> Crianças e adolescentes
      </h2>
      <p>
        O site não se destina à coleta de dados de menores. Mensagens de
        homenagem devem ser enviadas por pessoas capazes ou sob responsabilidade
        de um adulto.
      </p>

      <h2>
        <span className="legal-n">11.</span> Alterações
      </h2>
      <p>
        Podemos atualizar esta Política. A data no topo indica a última revisão.
        Mudanças relevantes serão sinalizadas no site.
      </p>

      <p className="legal-nota">
        <b>Modelo para revisão jurídica.</b> Este texto é um ponto de partida
        adequado à LGPD e deve ser revisado por advogado e ter os campos
        destacados preenchidos antes da publicação definitiva.
      </p>
    </LegalLayout>
  )
}
