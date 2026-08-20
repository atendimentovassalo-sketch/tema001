/* Termos de Uso.
 *
 * Quem mantém o site e qual o foro eleito vêm do INQUILINO — ver
 * `identidade.ts` e a migration 0016. A cláusula de foro SOME quando a comarca
 * não foi declarada: errar a comarca é pior do que não eleger foro, porque sem
 * eleição vale a regra geral da lei, que já protege o consumidor.
 *
 * A profundidade veio dos Termos do site estático da São Francisco
 * (20/08/2026), que tinham 756 palavras contra as ~300 genéricas que estavam
 * aqui — com regras de convivência das homenagens, ressalva de informação
 * orientativa e limite de responsabilidade. Duas adaptações ao produto:
 *   - o site do app não vende plano nem processa pagamento (§ 2 e § 7);
 *   - o endereço do site sai de `location.host`, e não de um domínio fixo.
 *
 * ⚠️ Texto jurídico gerado a partir do modelo da cliente. Vale revisão do
 * advogado junto com o aditivo de LGPD que está pendente. */
import { Link } from 'react-router-dom'
import LegalLayout from './LegalLayout'
import BlocoIdentidade from './BlocoIdentidade'
import { canalDeContato, foro } from './identidade'

export default function Termos() {
  /* O próprio endereço em que a pessoa está lendo. Sempre correto, em qualquer
     domínio de qualquer funerária — e sem um domínio escrito no código. */
  const dominio =
    typeof window !== 'undefined'
      ? window.location.host.replace(/^www\./, '')
      : 'este site'

  return (
    <LegalLayout titulo="Termos de uso" atualizadoEm="20 de agosto de 2026">
      {(f) => {
        /* O nome da funerária NÃO entra no meio das frases, e isso é decisão,
           não esquecimento: em português o artigo muda com o nome — "a Funerária
           São Francisco", mas "o Grupo Memorial", "a Casa X". Sem saber o gênero
           do nome cadastrado, qualquer artigo fixo erra em metade dos casos.
           Quem é a funerária está dito no bloco de identificação, com precisão;
           no corpo o documento fala na primeira pessoa do plural. */
        const contato = canalDeContato(f)
        const comarca = foro(f)
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
              Estes termos valem para quem navega em <b>{dominio}</b>, consulta o
              obituário, abre uma nota de falecimento ou deixa uma homenagem. Ao
              usar o site, você concorda com eles.
            </p>

            <h2>
              <span className="legal-n">1.</span> Quem mantém este site
            </h2>
            <BlocoIdentidade f={f} />

            <h2>
              <span className="legal-n">2.</span> O que o site oferece
            </h2>
            <p>
              O site é um <b>canal de informação e contato</b>. Ele publica o
              obituário e as notas de falecimento autorizadas pelas famílias,
              mantém a página de memorial de cada pessoa e recebe velas e
              homenagens dos visitantes.
            </p>
            <p>
              O site <b>não fecha contrato, não processa pagamento e não
              substitui o atendimento</b>. Em uma urgência, ligue: o telefone
              funciona 24 horas.
            </p>

            <h2>
              <span className="legal-n">3.</span> Informação orientativa, não
              aconselhamento
            </h2>
            <p>
              Os conteúdos sobre documentos, prazos e procedimentos são
              orientações gerais, escritas para ajudar quem está passando por um
              momento difícil. Regras de cartório, cemitério e órgãos públicos
              mudam e variam por município — confirme sempre com a funerária ou
              com o órgão competente. Horários de velório e sepultamento
              publicados podem ser alterados pela família até a última hora.
            </p>

            <h2>
              <span className="legal-n">4.</span> Notas de falecimento e
              memoriais
            </h2>
            <p>
              Uma nota só é publicada a pedido e com autorização de familiar
              responsável, que responde pela veracidade das informações e pelo
              direito de uso das fotografias enviadas. A qualquer momento a
              família pode pedir correção, despublicação ou exclusão definitiva,
              pelos canais de contato acima — e atendemos <b>sem custo</b>.
            </p>

            <h2>
              <span className="legal-n">5.</span> Velas e homenagens: regras de
              convivência
            </h2>
            <p>
              O espaço de homenagens existe para acolher a família. Acender uma
              vela é gratuito e não exige mais que um nome. Ao escrever uma
              mensagem, você se compromete a não publicar:
            </p>
            <ul>
              <li>
                ofensa, ameaça, discurso de ódio ou discriminação de qualquer
                natureza;
              </li>
              <li>
                informação falsa sobre a pessoa falecida ou sobre as
                circunstâncias da morte;
              </li>
              <li>dado pessoal de terceiros sem autorização;</li>
              <li>publicidade, corrente, cobrança ou pedido de dinheiro;</li>
              <li>conteúdo que viole direito autoral ou de imagem.</li>
            </ul>
            <p>
              As mensagens <b>podem passar por moderação</b> antes de aparecer,
              quando a família pede. Podemos <b>recusar ou remover</b> qualquer
              homenagem que descumpra estas regras, ou a pedido da família, sem
              necessidade de aviso prévio. Ao enviar uma homenagem, você autoriza
              a exibição do texto e do nome informado na página do memorial.
            </p>

            <h2>
              <span className="legal-n">6.</span> Conteúdo do site
            </h2>
            <p>
              Textos, identidade visual, fotografias e código são protegidos por
              direito autoral e pertencem à funerária identificada acima ou a
              quem os licenciou. Você
              pode <b>compartilhar os endereços das páginas livremente</b> — é
              para isso que as notas existem. Reproduzir, copiar ou adaptar o
              conteúdo para outros fins depende de autorização por escrito.
            </p>

            <h2>
              <span className="legal-n">7.</span> Planos e valores
            </h2>
            <p>
              Condições, coberturas, carências e valores de plano ou de serviço
              avulso são informados em <b>orçamento por escrito</b>, antes de
              qualquer contratação. O que estiver no site tem caráter
              informativo e pode ser atualizado; prevalece sempre o que constar
              do contrato assinado.
            </p>

            <h2>
              <span className="legal-n">8.</span> Disponibilidade e
              responsabilidade
            </h2>
            <p>
              Trabalhamos para manter o site no ar e correto, mas ele pode ficar
              indisponível por manutenção ou falha de terceiros. Não respondemos
              por indisponibilidade momentânea nem por decisão tomada
              exclusivamente com base em informação do site sem confirmação com a
              funerária. Nada aqui limita a responsabilidade pelos serviços
              funerários efetivamente contratados, que seguem o contrato e o
              Código de Defesa do Consumidor.
            </p>

            <h2>
              <span className="legal-n">9.</span> Links para outros sites
            </h2>
            <p>
              O site pode levar a páginas de terceiros — perfil no Google,
              WhatsApp, órgãos públicos. Não controlamos esses serviços nem
              respondemos pelo conteúdo e pelas políticas deles.
            </p>

            <h2>
              <span className="legal-n">10.</span> Privacidade
            </h2>
            <p>
              O tratamento de dados pessoais está descrito na{' '}
              <Link to="/privacidade">Política de privacidade</Link>, que faz
              parte destes termos.
            </p>

            <h2>
              <span className="legal-n">11.</span> Mudanças
            </h2>
            <p>
              Podemos atualizar estes termos. A versão vigente é sempre a
              publicada nesta página, com a data de atualização no topo.
            </p>

            <h2>
              <span className="legal-n">12.</span> Lei aplicável e foro
            </h2>
            <p>
              Aplica-se a lei brasileira.
              {comarca
                ? /* A vírgula depois da comarca não é estilo: o valor cadastrado
                     costuma ser "Catanduvas, Estado do Paraná", e sem ela a frase
                     saía "…Estado do Paraná para dirimir…", sem pausa. */
                  ` Fica eleito o foro da Comarca de ${comarca}, para dirimir controvérsias, ressalvado o direito do consumidor de acionar o foro do seu domicílio.`
                : ' A competência para dirimir controvérsias segue as regras legais aplicáveis, inclusive o direito do consumidor de acionar o foro do seu domicílio.'}
            </p>

            <h2>
              <span className="legal-n">13.</span> Como falar com a gente
            </h2>
            <p>
              Dúvidas sobre estes termos: fale <Canal />.
            </p>
            <BlocoIdentidade f={f} />
          </>
        )
      }}
    </LegalLayout>
  )
}
