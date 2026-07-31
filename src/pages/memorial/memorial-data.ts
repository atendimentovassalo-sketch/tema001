import type { Memorial } from './types'

/* Mock de um memorial para desenvolvimento/prévia. Sem backend ainda. */

const H = 3600_000
const D = 86_400_000
const agora = Date.now()
const atras = (ms: number) => new Date(agora - ms).toISOString()

const donaNair: Memorial = {
  id: 'o1',
  slug: 'nair-aparecida-de-souza',
  funeraria: {
    id: 't1',
    nome: 'Funerária Demonstração',
    cidade: 'Catanduvas',
    uf: 'PR',
    telefone: '(45) 3253-1234',
    whatsapp: '5545999990000',
    endereco: 'Rua Sete de Setembro, 120 · Centro',
    desde: '1987',
    corMarca: '#1F3A2E',
  },
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
  mensagens: [
    {
      id: 'm1',
      nome: 'Marli e família',
      texto:
        'Dona Nair vai fazer muita falta na nossa rua. Que Deus conforte a todos. 🙏',
      criadoEmISO: atras(2 * H),
      status: 'aprovada',
    },
    {
      id: 'm2',
      nome: 'Pe. Antônio',
      texto: 'Uma vida inteira dedicada à fé e à família. Rezaremos por ela.',
      criadoEmISO: atras(4 * H),
      status: 'aprovada',
    },
    {
      id: 'm3',
      nome: 'Cleuza (vizinha)',
      texto:
        'Sempre com um café pronto e um sorriso. Foi minha segunda mãe. Descanse em paz.',
      criadoEmISO: atras(5 * H),
      status: 'aprovada',
    },
  ],
  velas: [
    {
      id: 'v1',
      nome: 'Roberto',
      texto: 'Meus sentimentos a toda a família.',
      criadoEmISO: atras(1 * H),
    },
    {
      id: 'v2',
      nome: 'Aline',
      texto: 'Que a luz desta vela ilumine seu caminho.',
      criadoEmISO: atras(3 * H),
    },
    {
      id: 'v3',
      nome: 'Diego',
      texto: 'Com carinho e saudade.',
      criadoEmISO: atras(6 * H),
    },
    { id: 'v4', nome: 'Sônia', texto: null, criadoEmISO: atras(1 * D) },
  ],
  visitas: 1284,
  autorizadoPor: 'Maria de Souza (filha)',
  moderarMensagens: false,
}

export const memoriais: Memorial[] = [donaNair]

export function getMemorial(slug?: string): Memorial | undefined {
  if (!slug) return memoriais[0]
  return memoriais.find((m) => m.slug === slug)
}
