import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Clock,
  Calendar,
  Share2,
  ArrowLeft,
  Facebook,
  Twitter,
  Linkedin,
  Link as LinkIcon,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'

export default function BlogPost() {
  const { slug } = useParams()
  const [readingProgress, setReadingProgress] = useState(0)

  // Mock Content
  const article = {
    title: 'Como reduzir sua conta de luz em até 20% sem obras',
    subtitle:
      'Descubra o método legal e seguro que está ajudando milhares de famílias brasileiras a economizarem todos os meses.',
    author: {
      name: 'Ricardo Silva',
      role: 'Especialista em Energia',
      avatar: 'male',
    },
    date: '28 Nov 2025',
    readTime: '5 min',
    category: 'Economia Residencial',
    image:
      'https://img.usecurling.com/p/1200/600?q=energy%20bills%20saving&color=green',
  }

  // Scroll Progress Listener
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop
      const windowHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight
      const scroll = totalScroll / windowHeight
      setReadingProgress(Number(scroll.toFixed(2)) * 100)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.subtitle,
          url: window.location.href,
        })
      } catch (err) {
        console.log('Error sharing', err)
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: 'Link copiado!',
        description: 'URL copiada para a área de transferência.',
      })
    }
  }

  return (
    <div className="min-h-screen bg-white pt-20">
      {/* Reading Progress Bar */}
      <div
        className="fixed top-[80px] left-0 h-1 bg-primary z-50 transition-all duration-100"
        style={{ width: `${readingProgress}%` }}
      />

      {/* Header */}
      <header className="container mx-auto max-w-4xl px-4 py-12 text-center">
        <div className="flex justify-center mb-6">
          <Link
            to="/blog"
            className="inline-flex items-center text-sm font-medium text-primary hover:underline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para o Blog
          </Link>
        </div>
        <span className="inline-block bg-green-50 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
          {article.category}
        </span>
        <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6 font-heading leading-tight">
          {article.title}
        </h1>
        <p className="text-xl text-gray-500 mb-8 max-w-2xl mx-auto font-body leading-relaxed">
          {article.subtitle}
        </p>

        <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={`https://img.usecurling.com/ppl/thumbnail?gender=${article.author.avatar}`}
              />
              <AvatarFallback>{article.author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="font-medium text-gray-900">
              {article.author.name}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {article.date}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {article.readTime} de leitura
          </div>
        </div>
      </header>

      {/* Featured Image */}
      <div className="container mx-auto max-w-5xl px-4 mb-12">
        <div className="aspect-[21/9] rounded-2xl overflow-hidden shadow-lg">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover"
            loading="eager"
          />
        </div>
      </div>

      {/* Main Layout */}
      <div className="container mx-auto max-w-6xl px-4 grid grid-cols-1 lg:grid-cols-12 gap-12 pb-20">
        {/* Sidebar Left (TOC) & Content */}
        <div className="lg:col-span-8">
          {/* Content Body */}
          <article className="prose prose-lg max-w-none font-body text-gray-700 prose-headings:font-heading prose-headings:text-gray-900 prose-a:text-primary hover:prose-a:text-primary/80">
            <p className="lead text-xl">
              Você já imaginou receber sua conta de luz com 20% de desconto todo
              mês, sem precisar instalar painéis solares no telhado ou fazer
              qualquer tipo de obra em casa? Parece bom demais para ser verdade,
              mas é a realidade trazida pela Lei 14.300.
            </p>

            <h2 id="como-funciona">Como funciona a mágica?</h2>
            <p>
              Não é mágica, é tecnologia e regulação. O conceito é simples:
              grandes usinas solares e eólicas produzem energia muito mais
              barata do que as hidrelétricas tradicionais. Essa energia é
              injetada na rede da distribuidora local.
            </p>
            <p>
              Ao se cadastrar em uma plataforma de Geração Compartilhada, como a
              iGreen Energy, você "aluga" digitalmente uma parte dessa produção.
              A distribuidora reconhece que você está injetando energia limpa na
              rede e abate esse valor da sua conta.
            </p>

            <ShareableQuote
              text="A Geração Compartilhada democratizou o acesso à energia solar. Antes, era coisa de rico. Hoje, é para todos."
              author="Ricardo Silva"
            />

            <h2 id="beneficios">Principais Benefícios</h2>
            <ul>
              <li>
                <strong>Economia Imediata:</strong> Descontos de até 20% já na
                próxima fatura.
              </li>
              <li>
                <strong>Zero Investimento:</strong> Nenhuma taxa de adesão ou
                instalação.
              </li>
              <li>
                <strong>Sustentabilidade:</strong> Você incentiva a produção de
                energia limpa.
              </li>
              <li>
                <strong>Liberdade:</strong> Sem fidelidade, você pode sair
                quando quiser.
              </li>
            </ul>

            <div className="my-8 rounded-xl overflow-hidden shadow-md">
              <img
                src="https://img.usecurling.com/p/800/400?q=happy%20family%20bill&color=blue"
                alt="Família feliz com economia"
                className="w-full object-cover"
                loading="lazy"
              />
              <div className="bg-gray-50 p-4 text-sm text-gray-500 text-center italic">
                Famílias em todo o Brasil já estão economizando.
              </div>
            </div>

            <h2 id="como-comecar">Como começar a economizar hoje?</h2>
            <p>
              O processo é 100% digital. Você só precisa ter uma conta de luz em
              seu nome (ou da sua empresa) com valor médio acima de R$ 150,00.
            </p>
            <ol>
              <li>Faça uma simulação rápida.</li>
              <li>Envie uma foto da sua conta de luz.</li>
              <li>Assine o termo de adesão digitalmente.</li>
              <li>Pronto! A portabilidade é feita automaticamente.</li>
            </ol>

            <p>
              Não deixe dinheiro na mesa. A inflação energética é real, mas você
              tem a ferramenta para combatê-la agora mesmo.
            </p>
          </article>

          {/* Article Footer Share */}
          <div className="mt-12 py-8 border-t border-b border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-6">
            <span className="font-bold text-gray-900">
              Gostou? Compartilhe:
            </span>
            <div className="flex gap-4">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full hover:text-blue-600 hover:border-blue-600"
                onClick={() =>
                  window.open(
                    `https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`,
                    '_blank',
                  )
                }
              >
                <Facebook className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full hover:text-sky-500 hover:border-sky-500"
                onClick={() =>
                  window.open(
                    `https://twitter.com/intent/tweet?text=${article.title}&url=${window.location.href}`,
                    '_blank',
                  )
                }
              >
                <Twitter className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full hover:text-blue-700 hover:border-blue-700"
                onClick={() =>
                  window.open(
                    `https://www.linkedin.com/shareArticle?mini=true&url=${window.location.href}`,
                    '_blank',
                  )
                }
              >
                <Linkedin className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full"
                onClick={handleShare}
              >
                <LinkIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Related Articles */}
          <div className="mt-16">
            <h3 className="text-2xl font-bold mb-6 font-heading">
              Leia também
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <Link key={i} to="#" className="group block">
                  <div className="flex gap-4 items-start">
                    <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={`https://img.usecurling.com/p/200/200?q=energy&seed=${i}`}
                        alt="Related"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-primary uppercase">
                        Dicas
                      </span>
                      <h4 className="font-bold text-gray-800 group-hover:text-primary transition-colors line-clamp-2">
                        5 Dicas infalíveis para economizar no ar condicionado
                      </h4>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Sticky Sidebar (Right) */}
        <div className="lg:col-span-4 space-y-8">
          {/* Table of Contents */}
          <Card className="bg-gray-50 border-none shadow-sm">
            <CardContent className="p-6">
              <h4 className="font-bold text-gray-900 mb-4 uppercase text-sm tracking-wider">
                Neste artigo
              </h4>
              <nav className="flex flex-col gap-2">
                <a
                  href="#como-funciona"
                  className="text-gray-600 hover:text-primary text-sm py-1 transition-colors flex items-center"
                >
                  <ChevronRight className="h-3 w-3 mr-2" />
                  Como funciona a mágica?
                </a>
                <a
                  href="#beneficios"
                  className="text-gray-600 hover:text-primary text-sm py-1 transition-colors flex items-center"
                >
                  <ChevronRight className="h-3 w-3 mr-2" />
                  Principais Benefícios
                </a>
                <a
                  href="#como-comecar"
                  className="text-gray-600 hover:text-primary text-sm py-1 transition-colors flex items-center"
                >
                  <ChevronRight className="h-3 w-3 mr-2" />
                  Como começar hoje
                </a>
              </nav>
            </CardContent>
          </Card>

          {/* CTA Widget */}
          <div className="sticky top-24">
            <Card className="bg-primary text-primary-foreground border-none shadow-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 p-10 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
              <CardContent className="p-8 text-center relative z-10">
                <h3 className="text-2xl font-bold mb-2 font-heading">
                  Quer esses 20% de desconto?
                </h3>
                <p className="text-primary-foreground/90 mb-6 text-sm">
                  Junte-se a mais de 50.000 clientes satisfeitos. É grátis.
                </p>
                <Button
                  variant="secondary"
                  className="w-full font-bold text-primary hover:text-primary"
                  size="lg"
                >
                  SIMULAR AGORA
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Mobile Floating Share Button */}
      <div className="fixed bottom-6 right-6 z-50 lg:hidden">
        <Button
          size="icon"
          className="h-14 w-14 rounded-full shadow-xl bg-primary text-white hover:bg-primary/90"
          onClick={handleShare}
        >
          <Share2 className="h-6 w-6" />
        </Button>
      </div>
    </div>
  )
}

function ShareableQuote({ text, author }: { text: string; author: string }) {
  const handleShare = () => {
    const url = window.location.href
    const shareText = `"${text}" - ${author} \n\nLeia mais em: ${url}`
    if (navigator.share) {
      navigator
        .share({ title: 'Citação', text: shareText, url })
        .catch(() => {})
    } else {
      navigator.clipboard.writeText(shareText)
      toast({ title: 'Citação copiada!' })
    }
  }

  return (
    <div className="my-10 relative group cursor-pointer" onClick={handleShare}>
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-full"></div>
      <div className="pl-6 py-2">
        <p className="text-xl md:text-2xl font-serif italic text-gray-800 mb-2">
          "{text}"
        </p>
        <footer className="text-sm font-bold text-gray-500 uppercase tracking-wide flex items-center gap-2">
          — {author}
          <span className="opacity-0 group-hover:opacity-100 transition-opacity text-primary text-xs normal-case flex items-center bg-primary/10 px-2 py-1 rounded-full">
            <Share2 className="h-3 w-3 mr-1" />
            Clique para compartilhar
          </span>
        </footer>
      </div>
    </div>
  )
}
