import type { Funeraria, Memorial } from './types'

/* Mock de memoriais para desenvolvimento/prévia. Sem backend ainda. */

const H = 3600_000
const D = 86_400_000
const agora = Date.now()
const atras = (ms: number) => new Date(agora - ms).toISOString()

export const funeraria: Funeraria = {
  id: 't1',
  nome: 'Funerária Demonstração',
  cidade: 'Catanduvas',
  uf: 'PR',
  telefone: '(45) 3253-1234',
  whatsapp: '5545999990000',
  endereco: 'Rua Sete de Setembro, 120 · Centro',
  desde: '1987',
  sobre:
    'Há mais de três décadas cuidamos das famílias de Catanduvas e região com respeito, discrição e atendimento a qualquer hora. Um só telefone, uma equipe que conhece a cidade e acompanha cada detalhe.',
  corMarca: '#1F3A2E',
}

const donaNair: Memorial = {
  id: 'o1',
  slug: 'nair-aparecida-de-souza',
  funeraria,
  nomeCompleto: 'Nair Aparecida de Souza',
  apelido: 'Dona Nair',
  fotoUrl: null,
  nascimentoISO: '1948-03-12',
  cidadeNascimento: 'Catanduvas · PR',
  falecimentoISO: '2026-07-28',
  cidadeFalecimento: 'Cascavel · PR',
  idade: 78,
  epitafio: 'Onde havia café quente, havia lugar para todos.',
  historia:
    'Nair Aparecida de Souza nasceu na zona rural de Catanduvas, a mais velha de sete irmãos, e aprendeu cedo que a casa se mede pelo tanto de gente que cabe nela. Costurava, plantava e recebia — sempre com um café pronto no fogão.\n\nCasou-se com Sebastião em 1968 e com ele viveu 54 anos. Criou cinco filhos e ajudou a criar doze netos, e para cada um guardava uma história, um conselho e um prato feito com as próprias mãos.\n\nFoi catequista na paróquia por mais de trinta anos. Quem passou pela sua sala aprendeu que fé, para Dona Nair, era coisa de gesto: visitar o doente, acolher o vizinho, não deixar ninguém sem resposta. Partiu em casa, cercada pela família que formou.',
  eventos: [
    {
      id: 'e1',
      tipo: 'velorio',
      localNome: 'Capela Memorial São José',
      endereco: 'Av. Brasil, 980 · Catanduvas/PR',
      inicioISO: '2026-07-28T19:00:00-03:00',
      horarioConfirmado: true,
    },
    {
      id: 'e2',
      tipo: 'sepultamento',
      localNome: 'Cemitério Municipal de Catanduvas',
      endereco: null,
      inicioISO: null,
      horarioConfirmado: false,
    },
  ],
  fotos: [
    {
      id: 'f1',
      url: 'https://img.usecurling.com/p/400/400?q=grandmother%20portrait&seed=11',
    },
    {
      id: 'f2',
      url: 'https://img.usecurling.com/p/400/400?q=family%20garden%20vintage&seed=12',
    },
    {
      id: 'f3',
      url: 'https://img.usecurling.com/p/400/400?q=elderly%20woman%20smiling&seed=13',
    },
    {
      id: 'f4',
      url: 'https://img.usecurling.com/p/400/400?q=old%20family%20photo&seed=14',
    },
    {
      id: 'f5',
      url: 'https://img.usecurling.com/p/400/400?q=grandmother%20kitchen&seed=15',
    },
  ],
  homenagens: [
    {
      id: 'h1',
      nome: 'Roberto',
      texto: 'Meus sentimentos a toda a família.',
      vela: true,
      criadoEmISO: atras(1 * H),
      status: 'aprovada',
    },
    {
      id: 'h2',
      nome: 'Marli e família',
      texto:
        'Dona Nair vai fazer muita falta na nossa rua. Que Deus conforte a todos. 🙏',
      vela: false,
      criadoEmISO: atras(2 * H),
      status: 'aprovada',
    },
    {
      id: 'h3',
      nome: 'Aline',
      texto: 'Que a luz desta vela ilumine seu caminho.',
      vela: true,
      criadoEmISO: atras(3 * H),
      status: 'aprovada',
    },
    {
      id: 'h4',
      nome: 'Pe. Antônio',
      texto: 'Uma vida inteira dedicada à fé e à família. Rezaremos por ela.',
      vela: false,
      criadoEmISO: atras(4 * H),
      status: 'aprovada',
    },
    {
      id: 'h5',
      nome: 'Cleuza (vizinha)',
      texto:
        'Sempre com um café pronto e um sorriso. Foi minha segunda mãe. Descanse em paz.',
      vela: false,
      criadoEmISO: atras(5 * H),
      status: 'aprovada',
    },
    {
      id: 'h6',
      nome: 'Sônia',
      texto: null,
      vela: true,
      criadoEmISO: atras(1 * D),
      status: 'aprovada',
    },
  ],
  visitas: 1284,
  autorizadoPor: 'Maria de Souza (filha)',
  moderarMensagens: false,
}

const joseCarlos: Memorial = {
  id: 'o2',
  slug: 'jose-carlos-lima',
  funeraria,
  nomeCompleto: 'José Carlos Lima',
  apelido: 'Zé do Posto',
  fotoUrl:
    'https://img.usecurling.com/p/400/500?q=elderly%20man%20portrait&seed=21',
  nascimentoISO: '1955-09-20',
  cidadeNascimento: 'Cascavel · PR',
  falecimentoISO: '2026-07-27',
  cidadeFalecimento: 'Catanduvas · PR',
  idade: 70,
  epitafio: 'Atendia todo mundo pelo nome.',
  historia: null,
  eventos: [
    {
      id: 'e2a',
      tipo: 'velorio',
      localNome: 'Capela Municipal',
      endereco: 'Rua XV de Novembro, 45 · Catanduvas/PR',
      inicioISO: '2026-07-27T14:00:00-03:00',
      horarioConfirmado: true,
    },
    {
      id: 'e2b',
      tipo: 'sepultamento',
      localNome: 'Cemitério Municipal de Catanduvas',
      endereco: null,
      inicioISO: '2026-07-28T10:00:00-03:00',
      horarioConfirmado: true,
    },
  ],
  fotos: [],
  homenagens: [
    {
      id: 'h-jc1',
      nome: 'Turma do posto',
      texto: null,
      vela: true,
      criadoEmISO: atras(8 * H),
      status: 'aprovada',
    },
  ],
  visitas: 412,
  autorizadoPor: 'Sandra Lima (esposa)',
  moderarMensagens: false,
}

const therezinha: Memorial = {
  id: 'o3',
  slug: 'therezinha-alves',
  funeraria,
  nomeCompleto: 'Therezinha Alves',
  apelido: 'Dona Tetê',
  fotoUrl: null,
  nascimentoISO: '1940-01-15',
  cidadeNascimento: 'Guarapuava · PR',
  falecimentoISO: '2026-07-25',
  cidadeFalecimento: 'Catanduvas · PR',
  idade: 86,
  epitafio: null,
  historia: null,
  eventos: [
    {
      id: 'e3a',
      tipo: 'velorio',
      localNome: 'Capela Memorial São José',
      endereco: 'Av. Brasil, 980 · Catanduvas/PR',
      inicioISO: null,
      horarioConfirmado: false,
    },
  ],
  fotos: [],
  homenagens: [],
  visitas: 233,
  autorizadoPor: 'Marcos Alves (filho)',
  moderarMensagens: true,
}

const antonio: Memorial = {
  id: 'o4',
  slug: 'antonio-dos-santos',
  funeraria,
  nomeCompleto: 'Antônio dos Santos',
  apelido: null,
  fotoUrl:
    'https://img.usecurling.com/p/400/500?q=old%20man%20hat%20portrait&seed=24',
  nascimentoISO: '1962-11-02',
  cidadeNascimento: 'Catanduvas · PR',
  falecimentoISO: '2026-07-22',
  cidadeFalecimento: 'Cascavel · PR',
  idade: 63,
  epitafio: 'A viola cala, a música fica.',
  historia: null,
  eventos: [
    {
      id: 'e4a',
      tipo: 'velorio',
      localNome: 'Capela Municipal',
      endereco: 'Rua XV de Novembro, 45 · Catanduvas/PR',
      inicioISO: '2026-07-22T18:00:00-03:00',
      horarioConfirmado: true,
    },
  ],
  fotos: [],
  homenagens: [
    {
      id: 'h-an1',
      nome: 'Grupo de viola',
      texto: 'Até sempre, mestre.',
      vela: true,
      criadoEmISO: atras(2 * D),
      status: 'aprovada',
    },
  ],
  visitas: 851,
  autorizadoPor: 'Célia dos Santos (irmã)',
  moderarMensagens: false,
}

export const memoriais: Memorial[] = [donaNair, joseCarlos, therezinha, antonio]

export function getMemorial(slug?: string): Memorial | undefined {
  if (!slug) return memoriais[0]
  return memoriais.find((m) => m.slug === slug)
}

/** Publicados do inquilino, mais recentes primeiro. `excluir` remove um slug (página atual). */
export function publicados(opts?: {
  limite?: number
  excluir?: string
}): Memorial[] {
  const { limite = 60, excluir } = opts ?? {}
  return memoriais
    .filter((m) => m.slug !== excluir)
    .slice()
    .sort((a, b) => (a.falecimentoISO < b.falecimentoISO ? 1 : -1))
    .slice(0, limite)
}
