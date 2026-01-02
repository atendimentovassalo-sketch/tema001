export interface BlogPost {
  id: string
  slug: string
  title: string
  subtitle: string
  category: string
  author: {
    name: string
    role: string
    avatar: string
  }
  date: string
  readTime: string
  image: string
  content: ContentBlock[]
  tags: string[]
}

export type ContentBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; text: string; level: 2 | 3 }
  | { type: 'quote'; text: string; author?: string }
  | { type: 'list'; items: string[] }
  | { type: 'banner'; title: string; buttonText: string }
  | { type: 'image-grid'; items: { src: string; alt: string }[] }

export const categories = [
  'Todos',
  'Economia Doméstica',
  'Notícias iGreen',
  'Clube de Vantagens',
  'Sustentabilidade',
]

export const blogPosts: BlogPost[] = [
  {
    id: '1',
    slug: 'economizar-conta-luz-sem-paineis',
    title:
      'Como economizar até 15% na sua conta de luz sem investir em painéis solares',
    subtitle:
      'Descubra como o modelo de assinatura de energia solar permite reduzir seus custos mensais sem obras ou investimentos.',
    category: 'Economia Doméstica',
    author: {
      name: 'Carlos Mendes',
      role: 'Especialista em Energia',
      avatar: 'male',
    },
    date: '2024-11-28',
    readTime: '5 min',
    image:
      'https://img.usecurling.com/p/800/450?q=happy%20family%20saving%20money&color=green',
    tags: ['Economia', 'Sem Obras', 'Assinatura'],
    content: [
      {
        type: 'paragraph',
        text: 'Você sabia que é possível ter os benefícios da energia solar sem precisar instalar nenhum equipamento no seu telhado? O modelo de assinatura de energia, também conhecido como geração compartilhada, está revolucionando a forma como os brasileiros consomem eletricidade.',
      },
      {
        type: 'heading',
        text: 'Como funciona a energia por assinatura?',
        level: 2,
      },
      {
        type: 'paragraph',
        text: 'O conceito é simples: grandes usinas solares, eólicas ou de biogás geram energia e a injetam na rede da distribuidora local. Essa energia é transformada em créditos que são abatidos diretamente na sua conta de luz.',
      },
      {
        type: 'paragraph',
        text: 'Ao aderir à iGreen Energy, nós conectamos sua unidade consumidora a uma dessas usinas. Você passa a receber sua conta de luz com um desconto garantido, que pode chegar a 15% todos os meses.',
      },
      {
        type: 'quote',
        text: 'Não existe custo de adesão, não existe fidelidade e, principalmente, não existe obra. É 100% digital.',
        author: 'iGreen Energy',
      },
      {
        type: 'heading',
        text: 'Vantagens do modelo iGreen',
        level: 2,
      },
      {
        type: 'list',
        items: [
          'Zero Investimento: Não precisa comprar painéis nem fazer reformas.',
          'Economia Imediata: O desconto já vem na próxima fatura.',
          'Sustentabilidade: Você consome energia 100% limpa e renovável.',
          'Liberdade: Cancele quando quiser, sem multas.',
        ],
      },
      {
        type: 'banner',
        title: 'Quer começar a economizar agora?',
        buttonText: 'SIMULAR ECONOMIA',
      },
    ],
  },
  {
    id: '2',
    slug: 'lei-14300-energia-solar',
    title: 'Lei 14.300: O que muda para o consumidor de energia solar em 2024',
    subtitle:
      'Entenda o marco legal da geração própria de energia e por que o momento de aderir à energia solar por assinatura é agora.',
    category: 'Notícias iGreen',
    author: {
      name: 'Ana Souza',
      role: 'Consultora Jurídica',
      avatar: 'female',
    },
    date: '2024-11-15',
    readTime: '6 min',
    image:
      'https://img.usecurling.com/p/800/450?q=law%20justice%20energy&color=blue',
    tags: ['Legislação', 'Lei 14.300', 'Solar'],
    content: [
      {
        type: 'paragraph',
        text: 'A Lei 14.300, sancionada em 2022, estabeleceu o Marco Legal da Micro e Minigeração Distribuída no Brasil. Ela trouxe mais segurança jurídica para o setor, mas também introduziu novas regras de tarifação pelo uso da rede de distribuição (fio B).',
      },
      {
        type: 'heading',
        text: 'O que mudou na prática?',
        level: 2,
      },
      {
        type: 'paragraph',
        text: 'Para quem instala painéis solares em casa agora, existe um período de transição onde se paga uma taxa gradual pelo uso da rede. Isso aumentou o tempo de retorno do investimento (payback) para sistemas residenciais próprios.',
      },
      {
        type: 'heading',
        text: 'A vantagem da Geração Compartilhada',
        level: 2,
      },
      {
        type: 'paragraph',
        text: 'A boa notícia é que o modelo de geração compartilhada (assinatura) da iGreen Energy continua sendo extremamente vantajoso. Como operamos com usinas de grande porte e otimizadas, conseguimos absorver custos e repassar descontos significativos para o consumidor final, mantendo a atratividade econômica.',
      },
      {
        type: 'quote',
        text: 'A assinatura de energia blinda o consumidor das complexidades da instalação própria e garante economia simplificada.',
        author: 'Especialista iGreen',
      },
      {
        type: 'paragraph',
        text: 'Portanto, 2024 é o ano ideal para migrar para o modelo de assinatura, evitando os altos custos de capital (CAPEX) de um sistema próprio e aproveitando a economia imediata (OPEX).',
      },
      {
        type: 'banner',
        title: 'Garanta sua economia com a nova lei',
        buttonText: 'SIMULAR ECONOMIA',
      },
    ],
  },
  {
    id: '3',
    slug: 'clube-de-vantagens-igreen',
    title:
      'Muito além da energia: Maximize seus descontos com o Clube de Vantagens iGreen',
    subtitle:
      'Economize em farmácias, lojas de varejo e serviços de streaming com seu Clube de Vantagens exclusivo.',
    category: 'Clube de Vantagens',
    author: {
      name: 'Fernanda Torres',
      role: 'Gerente de Parcerias',
      avatar: 'female',
    },
    date: '2024-11-01',
    readTime: '4 min',
    image:
      'https://img.usecurling.com/p/800/450?q=shopping%20bags%20happy&color=orange',
    tags: ['Benefícios', 'Descontos', 'Parceiros'],
    content: [
      {
        type: 'paragraph',
        text: 'Ser cliente iGreen Energy não é apenas sobre pagar menos na conta de luz. É sobre fazer parte de um ecossistema de economia inteligente. Todos os nossos clientes têm acesso exclusivo ao Clube de Vantagens iGreen.',
      },
      {
        type: 'heading',
        text: 'Descontos em grandes marcas',
        level: 2,
      },
      {
        type: 'paragraph',
        text: 'Nós fechamos parcerias com as maiores redes de varejo e serviços do Brasil para que você economize em todas as áreas da sua vida. Confira alguns de nossos parceiros:',
      },
      {
        type: 'image-grid',
        items: [
          { src: 'https://img.usecurling.com/i?q=amazon', alt: 'Amazon' },
          { src: 'https://img.usecurling.com/i?q=magalu', alt: 'Magalu' },
          {
            src: 'https://img.usecurling.com/i?q=droga%20raia',
            alt: 'Droga Raia',
          },
          { src: 'https://img.usecurling.com/i?q=spotify', alt: 'Spotify' },
        ],
      },
      {
        type: 'heading',
        text: 'Como acessar?',
        level: 2,
      },
      {
        type: 'paragraph',
        text: 'O acesso é simples e digital. Basta entrar na sua área do cliente e gerar os cupons de desconto para usar nas lojas online ou apresentar o código nas lojas físicas parceiras (como farmácias).',
      },
      {
        type: 'list',
        items: [
          'Até 70% de desconto em farmácias.',
          'Cupons exclusivos em e-commerce.',
          'Descontos em entretenimento e lazer.',
        ],
      },
      {
        type: 'paragraph',
        text: 'Somando a economia na conta de luz com os descontos do Clube, o valor que sobra no seu bolso no final do mês é surpreendente.',
      },
      {
        type: 'banner',
        title: 'Faça parte do Clube iGreen',
        buttonText: 'SIMULAR ECONOMIA',
      },
    ],
  },
]
