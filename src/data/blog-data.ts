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

export const categories = [
  'Todos',
  'Iniciantes',
  'Economia Residencial',
  'Negócios & Renda',
  'Mitos & Verdades',
]

export const blogPosts: BlogPost[] = [
  {
    id: '1',
    slug: 'aumento-da-conta-de-luz-2025',
    title: 'Aumento de Tarifa: O que esperar da conta de luz em 2025?',
    subtitle:
      'Prepare-se para as mudanças nas bandeiras tarifárias e saiba como proteger seu orçamento familiar.',
    category: 'Economia Residencial',
    author: {
      name: 'Carlos Mendes',
      role: 'Especialista em Energia',
      avatar: 'male',
    },
    date: '2024-10-15',
    readTime: '5 min',
    image:
      'https://img.usecurling.com/p/800/450?q=electricity%20bill%20shock&color=white',
    tags: ['Tarifas', 'Economia', '2025'],
    content: [
      {
        type: 'paragraph',
        text: 'Com a previsão de escassez hídrica e o aumento dos custos de transmissão, as tarifas de energia elétrica devem sofrer novos reajustes em 2025. Para as famílias brasileiras, isso significa um peso ainda maior no orçamento mensal.',
      },
      {
        type: 'quote',
        text: 'A melhor forma de economizar não é desligar a geladeira, mas sim mudar a origem da sua energia.',
        author: 'Carlos Mendes',
      },
      {
        type: 'heading',
        text: 'Como as bandeiras tarifárias funcionam?',
        level: 2,
      },
      {
        type: 'paragraph',
        text: 'O sistema de bandeiras tarifárias foi criado para repassar ao consumidor os custos extras da geração de energia. Quando chove menos, acionamos as termelétricas, que são mais caras e poluentes.',
      },
      {
        type: 'banner',
        title: 'Quer fugir das bandeiras vermelhas?',
        buttonText: 'SIMULAR DESCONTO AGORA',
      },
      {
        type: 'heading',
        text: '3 Dicas para Blindar sua Conta',
        level: 2,
      },
      {
        type: 'list',
        items: [
          'Revise a vedação de janelas e portas para otimizar o ar condicionado.',
          'Troque lâmpadas antigas por LED.',
          'Adote a portabilidade de energia através da Geração Compartilhada.',
        ],
      },
    ],
  },
  {
    id: '2',
    slug: 'energia-solar-sem-obras',
    title: 'Energia Solar sem telhado? Entenda como funciona.',
    subtitle:
      'Você não precisa gastar R$ 20.000 em painéis para ter energia limpa e barata.',
    category: 'Iniciantes',
    author: {
      name: 'Ana Souza',
      role: 'Engenheira Ambiental',
      avatar: 'female',
    },
    date: '2024-10-10',
    readTime: '4 min',
    image:
      'https://img.usecurling.com/p/800/450?q=solar%20panels%20farm&color=green',
    tags: ['Solar', 'Inovação', 'Sem Obras'],
    content: [
      {
        type: 'paragraph',
        text: 'Muitas pessoas desistem da energia solar pelo alto custo de investimento inicial ou por morarem em apartamentos. Mas a tecnologia evoluiu.',
      },
      {
        type: 'heading',
        text: 'O conceito de Fazendas Solares',
        level: 2,
      },
      {
        type: 'paragraph',
        text: 'Grandes usinas são construídas em áreas com alta incidência solar. Essa energia é injetada na rede da distribuidora e transformada em créditos para o seu CPF ou CNPJ.',
      },
      {
        type: 'quote',
        text: 'Democratizar a energia é permitir que quem mora de aluguel também pague menos luz.',
      },
    ],
  },
  {
    id: '3',
    slug: 'mitos-sobre-portabilidade',
    title: '5 Mitos sobre trocar de fornecedor de energia',
    subtitle:
      'Ainda tem medo de ficar sem luz? Vamos desmistificar a portabilidade.',
    category: 'Mitos & Verdades',
    author: {
      name: 'Roberto Lima',
      role: 'Consultor Jurídico',
      avatar: 'male',
    },
    date: '2024-10-05',
    readTime: '6 min',
    image:
      'https://img.usecurling.com/p/800/450?q=light%20bulb%20idea&color=yellow',
    tags: ['Mitos', 'Segurança', 'Lei 14.300'],
    content: [
      {
        type: 'paragraph',
        text: 'Muita gente acha que trocar de fornecedor significa trocar a fiação da rua. Isso é um grande mito.',
      },
      { type: 'heading', text: 'Mito 1: A luz vai cair mais', level: 2 },
      {
        type: 'paragraph',
        text: 'A distribuição continua sendo responsabilidade da concessionária local. A estabilidade é a mesma.',
      },
    ],
  },
  {
    id: '4',
    slug: 'renda-extra-com-energia',
    title: 'Como transformar contatos em renda recorrente',
    subtitle:
      'O mercado de energia é trilionário e agora você pode morder uma fatia.',
    category: 'Negócios & Renda',
    author: {
      name: 'Fernanda Torres',
      role: 'Diretora de Expansão',
      avatar: 'female',
    },
    date: '2024-10-01',
    readTime: '7 min',
    image:
      'https://img.usecurling.com/p/800/450?q=business%20meeting%20growth&color=blue',
    tags: ['Empreendedorismo', 'Licenciamento', 'Renda'],
    content: [
      {
        type: 'paragraph',
        text: 'Imagine ganhar uma comissão toda vez que alguém paga a conta de luz. Isso é possível através do nosso modelo de licenciamento.',
      },
      {
        type: 'banner',
        title: 'Seja um Licenciado iGreen',
        buttonText: 'SAIBA MAIS',
      },
    ],
  },
  // Generating more placeholder posts to fill the grid and test "Load More"
  ...Array.from({ length: 12 }).map((_, i) => ({
    id: `mock-${i}`,
    slug: `artigo-exemplo-${i}`,
    title: `Dica de Economia #${i + 1}: Como reduzir gastos supérfluos`,
    subtitle:
      'Pequenas mudanças de hábito que geram grandes resultados no final do mês.',
    category: i % 2 === 0 ? 'Economia Residencial' : 'Iniciantes',
    author: { name: 'Equipe iGreen', role: 'Redação', avatar: 'male' },
    date: '2024-09-20',
    readTime: '3 min',
    image: `https://img.usecurling.com/p/800/450?q=money%20savings%20${i}&color=green`,
    tags: ['Dicas', 'Economia'],
    content: [
      {
        type: 'paragraph',
        text: 'Conteúdo demonstrativo para preencher a grade de posts.',
      } as ContentBlock,
    ],
  })),
]
