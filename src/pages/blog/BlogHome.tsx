import { useState, useEffect } from 'react'
import { BlogHero } from '@/components/blog/BlogHero'
import { BlogFilterBar } from '@/components/blog/BlogFilterBar'
import { ArticleCard } from '@/components/blog/ArticleCard'
import { ConversionBlock } from '@/components/blog/ConversionBlock'
import { NewsletterSignup } from '@/components/blog/NewsletterSignup'
import { blogPosts, categories } from '@/data/blog-data'
import { Button } from '@/components/ui/button'
import { Loader2, SearchX } from 'lucide-react'
import { AnimatedSection } from '@/components/AnimatedSection'
import { SEO } from '@/components/SEO'

const INITIAL_POSTS_COUNT = 9
const LOAD_MORE_COUNT = 6

export default function BlogHome() {
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [searchQuery, setSearchQuery] = useState('')
  const [visibleCount, setVisibleCount] = useState(INITIAL_POSTS_COUNT)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [filteredPosts, setFilteredPosts] = useState(blogPosts)

  // Filter logic (Category + Search)
  useEffect(() => {
    let result = blogPosts

    // 1. Filter by Category
    if (selectedCategory !== 'Todos') {
      result = result.filter((post) => post.category === selectedCategory)
    }

    // 2. Filter by Search Query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (post) =>
          post.title.toLowerCase().includes(query) ||
          post.subtitle.toLowerCase().includes(query),
      )
    }

    setFilteredPosts(result)
    setVisibleCount(INITIAL_POSTS_COUNT) // Reset pagination on filter change
  }, [selectedCategory, searchQuery])

  const handleLoadMore = () => {
    setIsLoadingMore(true)
    // Simulate API delay
    setTimeout(() => {
      setVisibleCount((prev) => prev + LOAD_MORE_COUNT)
      setIsLoadingMore(false)
    }, 800)
  }

  const visiblePosts = filteredPosts.slice(0, visibleCount)
  const hasMore = visibleCount < filteredPosts.length

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <SEO
        title="Portal de Inteligência"
        description="Notícias, dicas de economia e tudo sobre a revolução energética no Brasil. Fique por dentro do setor de energia solar e renovável."
      />

      {/* 1. Hero Section */}
      <BlogHero
        title="Portal de Inteligência iGreen"
        subtitle="Notícias, dicas de economia e tudo sobre a revolução energética no Brasil."
        ctaText="LER ARTIGO DESTAQUE"
        ctaLink={`/blog/${blogPosts[0].slug}`}
        bgImage="https://img.usecurling.com/p/1920/600?q=wind%20turbines%20sunset&color=black"
      />

      {/* 2. Sticky Filter Bar with Search */}
      <BlogFilterBar
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
      />

      {/* 3. Content Grid */}
      <div className="container mx-auto px-4 py-12">
        {visiblePosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {visiblePosts.map((post, index) => {
              // Logic to insert Conversion Blocks at specific slots
              const elements = []

              // Render the post card
              elements.push(
                <AnimatedSection key={post.id} delay={(index % 3) * 100}>
                  <ArticleCard post={post} />
                </AnimatedSection>,
              )

              // Insert Conversion Block 1 after the 6th item
              if (index === 5) {
                elements.push(
                  <AnimatedSection key="conversion-1" className="md:col-span-1">
                    <ConversionBlock type="simulator" />
                  </AnimatedSection>,
                )
              }

              // Insert Conversion Block 2 after the 13th item
              if (index === 12) {
                elements.push(
                  <AnimatedSection key="conversion-2" className="md:col-span-1">
                    <ConversionBlock type="licensee" />
                  </AnimatedSection>,
                )
              }

              return elements
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <SearchX className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Nenhum artigo encontrado
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Não encontramos resultados para "{searchQuery}" na categoria "
              {selectedCategory}". Tente outros termos ou limpe os filtros.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('Todos')
              }}
              className="mt-6"
            >
              Limpar Filtros
            </Button>
          </div>
        )}

        {/* 4. Load More */}
        {hasMore && (
          <div className="flex justify-center mt-16">
            <Button
              variant="outline"
              size="lg"
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="px-8 py-6 text-lg border-primary text-primary hover:bg-primary hover:text-white font-semibold shadow-sm transition-all"
            >
              {isLoadingMore ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Carregando...
                </>
              ) : (
                'Carregar Mais Artigos'
              )}
            </Button>
          </div>
        )}
      </div>

      {/* 5. Newsletter Section */}
      <NewsletterSignup />
    </div>
  )
}
