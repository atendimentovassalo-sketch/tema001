import { useState, useEffect } from 'react'
import { BlogHero } from '@/components/blog/BlogHero'
import { BlogFilterBar } from '@/components/blog/BlogFilterBar'
import { ArticleCard } from '@/components/blog/ArticleCard'
import { ConversionBlock } from '@/components/blog/ConversionBlock'
import { blogPosts, categories } from '@/data/blog-data'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { AnimatedSection } from '@/components/AnimatedSection'

const INITIAL_POSTS_COUNT = 9
const LOAD_MORE_COUNT = 6

export default function BlogHome() {
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [visibleCount, setVisibleCount] = useState(INITIAL_POSTS_COUNT)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [filteredPosts, setFilteredPosts] = useState(blogPosts)

  // Filter logic
  useEffect(() => {
    const filtered =
      selectedCategory === 'Todos'
        ? blogPosts
        : blogPosts.filter((post) => post.category === selectedCategory)
    setFilteredPosts(filtered)
    setVisibleCount(INITIAL_POSTS_COUNT) // Reset pagination on filter change
  }, [selectedCategory])

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
      {/* 1. Hero Section */}
      <BlogHero
        title="Painel de Inteligência iGreen"
        subtitle="Notícias, dicas de economia e tudo sobre a revolução energética no Brasil."
        ctaText="LER ARTIGO DESTAQUE"
        ctaLink={`/blog/${blogPosts[0].slug}`}
        bgImage="https://img.usecurling.com/p/1920/600?q=wind%20turbines%20sunset&color=black"
      />

      {/* 2. Sticky Filter Bar */}
      <BlogFilterBar
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* 3. Content Grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {visiblePosts.map((post, index) => {
            // Logic to insert Conversion Blocks at specific slots
            // Slot 7 (index 6) and Slot 14 (index 13)
            const elements = []

            // Render the post card
            elements.push(
              <AnimatedSection key={post.id} delay={(index % 3) * 100}>
                <ArticleCard post={post} />
              </AnimatedSection>,
            )

            // Insert Conversion Block 1 after the 6th item (index 5) - Wait, prompt says slot 7. So at index 6 (0-based)
            if (index === 5) {
              elements.push(
                <AnimatedSection key="conversion-1" className="md:col-span-1">
                  <ConversionBlock type="simulator" />
                </AnimatedSection>,
              )
            }

            // Insert Conversion Block 2 after the 13th item (index 12)
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

        {/* 4. Load More */}
        {hasMore && (
          <div className="flex justify-center mt-16">
            <Button
              variant="outline"
              size="lg"
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="px-8 py-6 text-lg border-primary text-primary hover:bg-primary hover:text-white font-semibold shadow-sm"
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

        {visiblePosts.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            <p className="text-xl">Nenhum artigo encontrado nesta categoria.</p>
          </div>
        )}
      </div>
    </div>
  )
}
