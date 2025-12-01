import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Clock, ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { AnimatedSection } from '@/components/AnimatedSection'

// Mock Data
const CATEGORIES = [
  'Todos',
  'Iniciantes',
  'Economia Residencial',
  'Negócios & Renda',
  'Mitos & Verdades',
]

interface Article {
  id: string
  title: string
  category: string
  readTime: string
  image: string
  slug: string
}

const MOCK_ARTICLES: Article[] = Array.from({ length: 20 }).map((_, i) => ({
  id: `article-${i}`,
  title: [
    'Como reduzir sua conta de luz em até 20% sem obras',
    'Entenda a Lei 14.300 e o Marco Legal da Energia',
    '5 Mitos sobre Energia Solar que você precisa esquecer',
    'O segredo para economizar no supermercado usando sua conta de luz',
    'Energia por Assinatura: Vale a pena em 2025?',
    'Como funciona a Geração Compartilhada na prática',
    'Dicas para identificar os vilões do consumo na sua casa',
  ][i % 7],
  category: CATEGORIES[1 + (i % 4)],
  readTime: `${3 + (i % 5)} min`,
  image: `https://img.usecurling.com/p/800/450?q=${['solar panel', 'electric bill', 'saving money', 'family happy', 'smart home'][i % 5]}&seed=${i}`,
  slug: `como-economizar-energia-${i}`,
}))

export default function BlogHome() {
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const ITEMS_PER_PAGE = 9 // Initial load

  // Simulate AJAX Filter/Load
  useEffect(() => {
    setLoading(true)
    const timeout = setTimeout(() => {
      let filtered = MOCK_ARTICLES
      if (selectedCategory !== 'Todos') {
        filtered = MOCK_ARTICLES.filter((a) => a.category === selectedCategory)
      }
      // Limit based on "page" (simulating load more)
      setArticles(filtered.slice(0, page * ITEMS_PER_PAGE))
      setLoading(false)
    }, 600)
    return () => clearTimeout(timeout)
  }, [selectedCategory, page])

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat)
    setPage(1) // Reset to first page on filter
  }

  const handleLoadMore = () => {
    setPage((prev) => prev + 1)
  }

  // Helper to inject conversion blocks
  const renderGridItems = () => {
    const items = []
    let articleCount = 0

    for (let i = 0; i < articles.length; i++) {
      const article = articles[i]
      articleCount++

      // Push Article
      items.push(<ArticleCard key={article.id} article={article} index={i} />)

      // Check for Conversion Block insertion (after 6th item -> index 6, after 12th item -> index 12, etc)
      // User story: "After every 6 article slots, specifically at positions 7 and 14"
      // Position 7 is index 6 (0-based if we count items).
      // So if articleCount is 6, insert block 1. If articleCount is 12, insert block 2.
      if (articleCount === 6) {
        items.push(
          <ConversionBlock
            key="conv-1"
            variant="green"
            title="Pare de pagar caro!"
            text="Simule agora e descubra quanto você pode economizar."
          />,
        )
      } else if (articleCount === 12) {
        items.push(
          <ConversionBlock
            key="conv-2"
            variant="dark"
            title="Energia Limpa e Barata"
            text="Sem fidelidade e sem obras. Ative seu desconto."
          />,
        )
      }
    }
    return items
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 1. Hero Section */}
      <section className="relative w-full h-[500px] flex items-center justify-center overflow-hidden bg-gray-900">
        <div className="absolute inset-0 z-0">
          <img
            src="https://img.usecurling.com/p/1920/1080?q=solar%20panels%20sunset&color=orange"
            alt="Blog Hero"
            className="w-full h-full object-cover opacity-40"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />
        </div>

        <div className="container relative z-10 px-4 text-center">
          <div className="mb-6 flex justify-center">
            <Breadcrumb className="text-gray-300">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink
                    href="/"
                    className="hover:text-white transition-colors"
                  >
                    Home
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="text-gray-500" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-primary font-bold">
                    Blog
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <AnimatedSection>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 tracking-tight font-heading">
              Aumento de Tarifa?
            </h1>
            <h2 className="text-xl md:text-2xl text-gray-200 mb-8 max-w-2xl mx-auto font-body font-light">
              Descubra como blindar sua conta de luz contra a inflação
              energética e garantir descontos mensais.
            </h2>
            <Button
              size="lg"
              className="bg-cta hover:bg-cta/90 text-white font-bold text-lg px-8 py-6 rounded-full shadow-lg hover:scale-105 transition-transform"
              asChild
            >
              <Link to="/blog/como-economizar-energia-0">
                LER ARTIGO DESTAQUE
              </Link>
            </Button>
          </AnimatedSection>
        </div>
      </section>

      {/* 2. Intent Filter Nav */}
      <div className="sticky top-[80px] z-40 bg-white/95 backdrop-blur border-b border-gray-200 shadow-sm py-4">
        <div className="container mx-auto overflow-x-auto hide-scrollbar px-4">
          <div className="flex items-center md:justify-center gap-3 min-w-max">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={cn(
                  'px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 whitespace-nowrap',
                  selectedCategory === cat
                    ? 'bg-primary text-white shadow-md scale-105'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900',
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Content Grid */}
      <section className="py-16 container mx-auto px-4 max-w-7xl">
        {loading && page === 1 ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {renderGridItems()}
          </div>
        )}

        {/* Load More */}
        <div className="mt-16 text-center">
          <Button
            variant="outline"
            size="lg"
            onClick={handleLoadMore}
            disabled={loading}
            className="min-w-[200px] border-primary text-primary hover:bg-primary hover:text-white font-bold"
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              'VER MAIS ARTIGOS'
            )}
          </Button>
        </div>
      </section>
    </div>
  )
}

// --- Components ---

function ArticleCard({ article, index }: { article: Article; index: number }) {
  const shareOnWhatsapp = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const text = `Olha esse artigo que legal: ${article.title}`
    const url = window.location.origin + `/blog/${article.slug}`
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
      '_blank',
    )
  }

  return (
    <AnimatedSection delay={index * 50} className="h-full">
      <Link to={`/blog/${article.slug}`} className="group block h-full">
        <Card className="h-full overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-white flex flex-col">
          <div className="relative overflow-hidden aspect-video">
            <div className="absolute top-4 left-4 z-10 bg-primary/90 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
              {article.category}
            </div>
            <img
              src={article.image}
              alt={article.title}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <CardContent className="p-6 flex flex-col flex-grow relative">
            <div className="flex items-center gap-2 text-gray-400 text-xs font-semibold mb-3 uppercase tracking-wide">
              <Clock className="h-3 w-3" />
              {article.readTime} de leitura
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-4 leading-tight font-heading group-hover:text-primary transition-colors line-clamp-3">
              {article.title}
            </h3>

            <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-100">
              <span className="text-sm font-medium text-primary flex items-center group/link">
                Ler artigo
                <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover/link:translate-x-1" />
              </span>
              <button
                onClick={shareOnWhatsapp}
                className="p-2 rounded-full bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                aria-label="Compartilhar no WhatsApp"
              >
                <img
                  src="https://img.usecurling.com/i?q=whatsapp&color=green&shape=fill"
                  alt="WhatsApp"
                  className="w-5 h-5"
                />
              </button>
            </div>
          </CardContent>
        </Card>
      </Link>
    </AnimatedSection>
  )
}

function ConversionBlock({
  variant,
  title,
  text,
}: {
  variant: 'green' | 'dark'
  title: string
  text: string
}) {
  const isGreen = variant === 'green'

  return (
    <AnimatedSection className="h-full">
      <div
        className={cn(
          'h-full w-full rounded-xl p-8 flex flex-col items-center justify-center text-center shadow-elevation relative overflow-hidden group cursor-pointer',
          isGreen ? 'bg-primary' : 'bg-gray-800',
        )}
      >
        {/* Decorative circles */}
        <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/10 blur-2xl group-hover:bg-white/20 transition-colors" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-black/10 blur-2xl" />

        <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-4 relative z-10 font-heading">
          {title}
        </h3>
        <p className="text-white/90 text-lg mb-8 relative z-10 font-body">
          {text}
        </p>
        <Button
          variant={isGreen ? 'secondary' : 'default'}
          size="lg"
          className={cn(
            'w-full font-bold shadow-lg relative z-10',
            isGreen
              ? 'text-primary hover:text-primary'
              : 'bg-cta text-white hover:bg-cta/90',
          )}
        >
          QUERO ECONOMIZAR
        </Button>
      </div>
    </AnimatedSection>
  )
}
