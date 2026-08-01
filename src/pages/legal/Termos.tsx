/* Termos de Uso. Campos entre destaque são preenchidos pela funerária. */
import LegalLayout from './LegalLayout'

export default function Termos() {
  return (
    <LegalLayout titulo="Termos de Uso" atualizadoEm="agosto de 2026">
      <p>
        Estes Termos regem o uso deste site de memorial e obituário, mantido por{' '}
        Carvalho &amp; Borak Ltda (Funerária São Francisco), CNPJ
        79.036.497/0001-58. Ao acessar ou usar o site, você concorda com estas
        condições.
      </p>

      <h2>
        <span className="legal-n">1.</span> O que o site oferece
      </h2>
      <p>
        Publicamos notas de falecimento e páginas de memorial, onde visitantes
        podem acender uma vela e deixar homenagens. As notas são criadas pela
        funerária com autorização da família.
      </p>

      <h2>
        <span className="legal-n">2.</span> Homenagens dos visitantes
      </h2>
      <ul>
        <li>
          Ao enviar uma homenagem, você declara que a mensagem é sua, respeitosa
          e verdadeira, e autoriza sua exibição na página.
        </li>
        <li>
          É proibido conteúdo ofensivo, difamatório, discriminatório, ilegal ou
          que viole direitos de terceiros.
        </li>
        <li>
          Podemos moderar, editar ou remover homenagens, com ou sem aviso,
          especialmente a pedido da família ou em caso de abuso.
        </li>
      </ul>

      <h2>
        <span className="legal-n">3.</span> Conteúdo publicado
      </h2>
      <p>
        As informações da nota (nome, foto, datas, biografia e eventos) são
        fornecidas pela família e publicadas pela funerária, responsáveis por
        sua veracidade e pela autorização de uso. Se você identificar erro ou
        uso indevido, avise-nos para correção ou remoção.
      </p>

      <h2>
        <span className="legal-n">4.</span> Uso adequado
      </h2>
      <p>
        Você concorda em não tentar burlar mecanismos de segurança, sobrecarregar
        o serviço, coletar dados de terceiros de forma automatizada ou usar o
        site para fins diversos da homenagem e informação.
      </p>

      <h2>
        <span className="legal-n">5.</span> Propriedade intelectual
      </h2>
      <p>
        O layout, a marca e os elementos do site pertencem aos seus titulares.
        Fotos e textos das famílias permanecem de titularidade delas, que
        autorizam a exibição aqui.
      </p>

      <h2>
        <span className="legal-n">6.</span> Disponibilidade
      </h2>
      <p>
        Empenhamo-nos para manter o site no ar, mas ele pode passar por
        interrupções de manutenção ou por fatores fora do nosso controle. O
        atendimento da funerária permanece disponível pelo telefone informado.
      </p>

      <h2>
        <span className="legal-n">7.</span> Limitação de responsabilidade
      </h2>
      <p>
        Na máxima extensão permitida pela lei, não respondemos por danos
        indiretos decorrentes do uso do site ou de conteúdo enviado por
        terceiros. Nada nestes Termos afasta direitos garantidos ao consumidor.
      </p>

      <h2>
        <span className="legal-n">8.</span> Privacidade
      </h2>
      <p>
        O tratamento de dados pessoais é descrito na nossa{' '}
        <a href="/privacidade">Política de Privacidade</a>, que integra estes
        Termos.
      </p>

      <h2>
        <span className="legal-n">9.</span> Alterações e contato
      </h2>
      <p>
        Podemos atualizar estes Termos; a data no topo indica a última revisão.
        Dúvidas podem ser enviadas para equipeavassaladora@gmail.com.
      </p>

      <h2>
        <span className="legal-n">10.</span> Lei aplicável e foro
      </h2>
      <p>
        Aplica-se a legislação brasileira. Fica eleito o foro da comarca de
        Catanduvas, Estado do Paraná, salvo disposição legal em contrário que
        favoreça o consumidor.
      </p>
    </LegalLayout>
  )
}
