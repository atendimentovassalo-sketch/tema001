/* Política de Privacidade (LGPD).
 *
 * QUEM RESPONDE VEM DO INQUILINO, não do código: esta página é servida no
 * domínio de cada funerária, e até 20/08/2026 declarava a Carvalho & Borak Ltda
 * como controladora em todos eles. As frases são montadas em `identidade.ts`,
 * que nunca imprime lacuna nem inventa dado.
 *
 * A PROFUNDIDADE VEIO DO DOCUMENTO DA CLIENTE (20/08/2026): o site estático da
 * São Francisco já tinha uma política de 1.197 palavras, com base legal artigo
 * por artigo, prazo de resposta e menção à ANPD — muito melhor que a genérica
 * que estava aqui. Ela virou o gabarito, com uma diferença medida no código:
 * o site estático carrega fontes do Google e ESTE APP NÃO carrega nada de
 * terceiros, então a cláusula de Google Fonts não foi copiada. Cada afirmação
 * técnica daqui foi conferida contra o código:
 *   - PBKDF2-SHA256 .................. functions/_lib/auth.ts
 *   - cookie httpOnly/SameSite/Secure  functions/_lib/auth.ts
 *   - Resend para e-mail transacional  functions/_lib/email.ts
 *   - IP guardado só embaralhado ..... coluna ip_hash (migrations 0001, 0007)
 *   - cadastro de clientes e cobrança  migrations 0008/0009
 *   - zero rastreadores .............. varredura em index.html e src/
 *
 * ⚠️ Texto jurídico gerado a partir do modelo da cliente. Vale revisão do
 * advogado junto com o aditivo de LGPD que está pendente. */
import LegalLayout from './LegalLayout'
import BlocoIdentidade from './BlocoIdentidade'
import { canalDeContato } from './identidade'

export default function Privacidade() {
  return (
    <LegalLayout
      titulo="Política de privacidade"
      atualizadoEm="20 de agosto de 2026"
    >
      {(f) => {
        const contato = canalDeContato(f)
        const nome = f?.nome ?? 'a funerária'
        const Canal = () => (
          <>
            {contato.prefixo}
            {contato.texto &&
              (contato.href ? (
                <a href={contato.href}>{contato.texto}</a>
              ) : (
                contato.texto
              ))}
          </>
        )
        return (
          <>
            <p>
              Esta política explica quais dados pessoais {nome} trata, por que
              trata, com quem compartilha e o que você pode exigir a qualquer
              momento. Ela segue a Lei nº 13.709/2018 (LGPD).
            </p>

            <h2>
              <span className="legal-n">1.</span> Quem é o responsável pelos
              seus dados
            </h2>
            <p>O controlador dos dados tratados neste site e no atendimento é:</p>
            <BlocoIdentidade f={f} />
            <p>
              O contato para qualquer assunto de privacidade — inclusive o
              exercício dos seus direitos — é <Canal />, que funciona também
              como canal do encarregado pelo tratamento de dados (art. 41 da
              LGPD).
            </p>

            <h2>
              <span className="legal-n">2.</span> Que dados tratamos
            </h2>
            <ul>
              <li>
                <b>Quando você nos procura.</b> Nome, telefone, e-mail e o
                conteúdo da conversa, quando você liga, manda mensagem no
                WhatsApp ou escreve para o nosso e-mail.
              </li>
              <li>
                <b>Quando publicamos uma nota de falecimento.</b> Nome, apelido,
                datas e cidades de nascimento e falecimento, fotografia, texto
                biográfico e informações de velório e sepultamento da pessoa
                falecida, além do nome de quem, pela família, autorizou a
                publicação. Esses dados chegam até nós <b>pela própria família</b>
                , no atendimento, e só vão ao ar com autorização dela.
              </li>
              <li>
                <b>Quando alguém acende uma vela ou deixa uma homenagem.</b> O
                nome informado, a mensagem escrita (quando há) e uma marca
                técnica antifraude derivada do endereço de IP — guardamos essa
                marca de forma embaralhada, <b>nunca o endereço de IP em si</b>.
              </li>
              <li>
                <b>Quando você contrata um plano funerário ou é atendido.</b>{' '}
                Nome, telefone, documento de identificação, endereço, o valor e o
                dia de vencimento da mensalidade e o histórico do que foi pago ou
                está em aberto. Esses dados ficam num cadastro interno, usado pela
                equipe da funerária para administrar o contrato e a cobrança. Esse
                cadastro <b>não é público</b> e não aparece em nenhuma página do
                site.
              </li>
              <li>
                <b>Dados técnicos de navegação.</b> O provedor de hospedagem
                registra dados de acesso para segurança e para manter o site no
                ar. O site <b>não usa Google Analytics, pixel de rede social nem
                qualquer ferramenta de publicidade ou rastreamento
                comportamental</b>, e não carrega fontes, scripts ou imagens de
                servidores de terceiros.
              </li>
            </ul>

            <h2>
              <span className="legal-n">3.</span> Por que tratamos, e com que
              base legal
            </h2>
            <ul>
              <li>
                <b>Atender você e executar o serviço funerário</b> — execução de
                contrato e procedimentos preliminares (art. 7º, V).
              </li>
              <li>
                <b>Publicar a nota de falecimento e o memorial</b> —
                consentimento da família responsável (art. 7º, I), revogável a
                qualquer momento.
              </li>
              <li>
                <b>Exibir velas e homenagens</b> — consentimento de quem
                escreve, manifestado ao enviar (art. 7º, I).
              </li>
              <li>
                <b>Cumprir obrigações legais</b> de registro civil, fiscais e
                sanitárias (art. 7º, II).
              </li>
              <li>
                <b>Administrar o plano funerário e a cobrança</b> — execução de
                contrato (art. 7º, V) e obrigação legal (art. 7º, II) quanto aos
                registros contábeis e fiscais que a lei manda guardar.
              </li>
              <li>
                <b>Manter o site seguro e disponível</b> — legítimo interesse
                (art. 7º, IX), limitado ao mínimo necessário.
              </li>
            </ul>

            <h2>
              <span className="legal-n">4.</span> Com quem compartilhamos
            </h2>
            <p>
              Compartilhamos apenas o necessário e apenas com quem participa do
              serviço:
            </p>
            <ul>
              <li>
                <b>Cartório de registro civil</b>, para a lavratura da certidão
                de óbito.
              </li>
              <li>
                <b>Cemitério, capela ou crematório</b> escolhido pela família.
              </li>
              <li>
                <b>Plano ou seguradora</b>, quando a família tiver cobertura e
                pedir o acionamento.
              </li>
              <li>
                <b>Cloudflare, Inc.</b> — hospedagem, banco de dados e
                armazenamento das fotografias do memorial. Servidores fora do
                Brasil, com transferência internacional amparada em cláusulas
                contratuais de proteção.
              </li>
              <li>
                <b>Resend, Inc.</b> — envio dos e-mails automáticos do painel
                administrativo (por exemplo, redefinição de senha).
              </li>
            </ul>
            <p>
              O sistema usado para publicar as notas de falecimento e manter o
              cadastro de planos é fornecido por um prestador que atua como{' '}
              <b>operador</b> (art. 39 da LGPD): ele trata os dados
              exclusivamente por conta e segundo as instruções da funerária, não
              os utiliza para finalidade própria e não os compartilha com
              terceiros. {nome} permanece a <b>controladora</b> — é a quem você
              recorre para qualquer pedido sobre os seus dados.
            </p>
            <p className="legal-nota">
              Não vendemos, alugamos nem cedemos seus dados para publicidade de
              terceiros.
            </p>

            <h2>
              <span className="legal-n">5.</span> Por quanto tempo guardamos
            </h2>
            <ul>
              <li>
                Dados de atendimento e contratação: pelo prazo legal de guarda de
                documentos fiscais e civis.
              </li>
              <li>
                Notas de falecimento e memoriais: enquanto a família desejar. A
                pedido de familiar responsável, despublicamos ou apagamos — e a
                exclusão remove também as fotografias armazenadas.
              </li>
              <li>Velas e homenagens: enquanto o memorial estiver publicado.</li>
              <li>
                Cadastro de plano funerário e histórico de pagamentos: enquanto o
                contrato estiver ativo e, depois de encerrado, pelo prazo legal de
                guarda contábil e fiscal. Encerrado esse prazo, o cadastro é
                eliminado.
              </li>
              <li>
                Registros técnicos de acesso: pelo prazo do provedor de
                hospedagem.
              </li>
            </ul>
            <p className="legal-nota">
              A LGPD protege pessoas naturais vivas. Dados da pessoa falecida são
              publicados sob responsabilidade e autorização da família; ainda
              assim, tratamos com respeito e removemos informações a pedido de
              quem tenha legitimidade.
            </p>

            <h2>
              <span className="legal-n">6.</span> Cookies
            </h2>
            <p>
              As páginas públicas deste site — obituário, notas de falecimento e
              memoriais — <b>não usam cookies</b> de análise ou de publicidade. O
              painel administrativo, restrito à equipe da funerária, usa um único
              cookie estritamente necessário para manter a sessão de quem fez
              login. Ele é <b>httpOnly</b>, viaja apenas por conexão segura, não
              identifica visitantes e não acompanha ninguém por outros sites.
            </p>

            <h2>
              <span className="legal-n">7.</span> Seus direitos
            </h2>
            <p>
              A LGPD garante a você, a qualquer momento e sem custo, o direito
              de:
            </p>
            <ul>
              <li>confirmar se tratamos dados seus e acessar esses dados;</li>
              <li>corrigir dados incompletos, inexatos ou desatualizados;</li>
              <li>
                pedir anonimização, bloqueio ou eliminação de dados
                desnecessários ou tratados fora da lei;
              </li>
              <li>pedir a portabilidade dos dados;</li>
              <li>
                revogar o consentimento e pedir a exclusão dos dados tratados com
                base nele;
              </li>
              <li>saber com quem compartilhamos seus dados;</li>
              <li>opor-se a um tratamento que considere irregular.</li>
            </ul>
            <p>
              Para exercer, entre em contato <Canal />. Respondemos{' '}
              <b>em até 15 dias</b>. Para proteger a própria pessoa, podemos
              pedir uma confirmação de identidade antes de atender ao pedido.
            </p>

            <h2>
              <span className="legal-n">8.</span> Segurança
            </h2>
            <p>
              As senhas do painel são guardadas com derivação criptográfica
              (PBKDF2-SHA256) — nem a funerária nem o operador conseguem lê-las.
              O site trafega inteiramente em HTTPS, o acesso ao painel é restrito
              a pessoas autorizadas, e as homenagens passam por proteção contra
              envio automatizado. Nenhum sistema é infalível: se ocorrer um
              incidente com risco relevante, comunicaremos os titulares afetados
              e a ANPD, como manda o art. 48 da LGPD.
            </p>

            <h2>
              <span className="legal-n">9.</span> Dados de crianças e
              adolescentes
            </h2>
            <p>
              Quando a nota de falecimento se refere a uma criança ou
              adolescente, ou quando eles aparecem em fotografias, o tratamento
              acontece no melhor interesse do menor e mediante autorização
              expressa dos pais ou responsáveis. Mensagens de homenagem devem ser
              enviadas por pessoas capazes ou sob responsabilidade de um adulto.
            </p>

            <h2>
              <span className="legal-n">10.</span> Mudanças nesta política
            </h2>
            <p>
              Se esta política mudar, publicaremos a nova versão nesta mesma
              página, com a data de atualização no topo. Recomendamos reler
              quando voltar a usar nossos serviços.
            </p>

            <h2>
              <span className="legal-n">11.</span> Fale com a gente
            </h2>
            <p>
              Dúvida, pedido ou reclamação sobre dados pessoais: fale <Canal />.
              Você também pode recorrer à Autoridade Nacional de Proteção de
              Dados (ANPD).
            </p>
          </>
        )
      }}
    </LegalLayout>
  )
}
