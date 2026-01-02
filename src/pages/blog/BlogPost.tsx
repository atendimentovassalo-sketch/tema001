import { useParams } from 'react-router-dom'
import { blogPosts } from '@/data/blog-data'
import { ReadingProgressBar } from '@/components/blog/ReadingProgressBar'
import { BlogSidebar } from '@/components/blog/BlogSidebar'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { ShareableQuote } from '@/components/blog/ShareableQuote'
import { Button } from '@/components/ui/button'
import { ArrowRight, CalendarDays, Clock, Zap } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import NotFound from '@/pages/NotFound'
import { ArticleCard } from '@/components/blog/ArticleCard'
import { SEO } from '@/components/SEO'
import { NewsletterSignup } from '@/components/blog/NewsletterSignup'

export default function BlogPost() {
  const { slug } = useParams()
  const post = blogPosts.find((p) => p.slug === slug)

  if (!post) {
    return <NotFound />
  }

  // Identify related posts based on category or just exclude current
  const relatedPosts = blogPosts
    .filter((p) => p.id !== post.id && p.category === post.category)
    .slice(0, 3)

  // Fallback if not enough related posts in same category
  if (relatedPosts.length < 3) {
    const remaining = 3 - relatedPosts.length
    const others = blogPosts
      .filter(
        (p) =>
          p.id !== post.id &&
          !relatedPosts.find((related) => related.id === p.id),
      )
      .slice(0, remaining)
    relatedPosts.push(...others)
  }

  const handleSimular = () => {
    window.location.href = '/#simulador'
  }

  return (
    <div className="min-h-screen bg-white font-body">
      <SEO title={post.title} description={post.subtitle} />
      <ReadingProgressBar />

      {/* Header */}
      <header className="pt-32 pb-12 bg-gray-50 border-b border-gray-100">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <div className="flex justify-center mb-6">
            <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-4 py-1.5 text-sm font-bold uppercase tracking-wide">
              {post.category}
            </Badge>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-foreground mb-6 leading-tight font-heading">
            {post.title}
          </h1>
          <div className="flex flex-wrap justify-center items-center gap-6 text-gray-500 text-sm md:text-base">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={`https://img.usecurling.com/ppl/thumbnail?gender=${post.author.avatar}&seed=${post.id}`}
                  alt={post.author.name}
                />
                <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="font-medium text-foreground">
                {post.author.name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              <span>
                {format(new Date(post.date), "d 'de' MMMM, yyyy", {
                  locale: ptBR,
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{post.readTime} de leitura</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main Content Column */}
          <div className="lg:w-[70%]">
            {/* Featured Image */}
            <div className="rounded-2xl overflow-hidden mb-12 shadow-lg bg-gray-100">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-auto object-cover aspect-video"
              />
            </div>

            {/* Article Body */}
            <article className="prose prose-lg prose-stone max-w-none mx-auto lg:mx-0 font-body">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 mb-10 not-prose">
                <h3 className="text-lg font-bold mb-4 font-heading text-foreground">
                  Neste artigo:
                </h3>
                <ul className="space-y-2">
                  {post.content
                    .filter((block) => block.type === 'heading')
                    .map((block: any, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
                      >
                        <ArrowRight className="h-3 w-3 text-primary" />
                        <a
                          href={`#heading-${i}`}
                          className="text-sm font-medium hover:underline"
                        >
                          {block.text}
                        </a>
                      </li>
                    ))}
                </ul>
              </div>

              {post.content.map((block, index) => {
                switch (block.type) {
                  case 'paragraph':
                    return (
                      <p
                        key={index}
                        className="text-[#333333] leading-relaxed mb-6 text-base md:text-[18px]"
                      >
                        {block.text}
                      </p>
                    )
                  case 'heading':
                    return (
                      <h2
                        id={`heading-${index}`}
                        key={index}
                        className={`text-2xl md:text-3xl font-bold text-foreground mt-10 mb-6 font-heading scroll-mt-28`}
                      >
                        {block.text}
                      </h2>
                    )
                  case 'quote':
                    return (
                      <ShareableQuote
                        key={index}
                        text={block.text}
                        author={block.author}
                      />
                    )
                  case 'list':
                    return (
                      <ul key={index} className="space-y-3 mb-8 list-none pl-0">
                        {block.items.map((item, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <div className="mt-2 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                            <span className="text-[#333333] text-base md:text-[18px]">
                              {item}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )
                  case 'banner':
                    return (
                      <div
                        key={index}
                        className="my-10 bg-primary/5 border-y-2 border-primary p-8 flex flex-col md:flex-row items-center justify-between gap-6 rounded-lg"
                      >
                        <div>
                          <h4 className="text-xl font-bold text-primary mb-2 font-heading">
                            {block.title}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Simulação gratuita e sem compromisso.
                          </p>
                        </div>
                        <Button
                          onClick={handleSimular}
                          className="bg-primary hover:bg-primary/90 text-white font-bold whitespace-nowrap"
                        >
                          {block.buttonText}
                        </Button>
                      </div>
                    )
                  case 'image-grid':
                    return (
                      <div
                        key={index}
                        className="grid grid-cols-2 md:grid-cols-4 gap-8 my-12 items-center justify-items-center"
                      >
                        {block.items.map((item, i) => (
                          <div
                            key={i}
                            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-center w-full aspect-square hover:shadow-md transition-shadow"
                          >
                            <img
                              src={item.src}
                              alt={item.alt}
                              className="max-w-full max-h-full object-contain filter hover:brightness-110 transition-all"
                            />
                          </div>
                        ))}
                      </div>
                    )
                  default:
                    return null
                }
              })}
            </article>

            <Separator className="my-12" />

            {/* Author Footer */}
            <div className="bg-gray-50 rounded-xl p-8 flex flex-col md:flex-row items-center md:items-start gap-6">
              <Avatar className="h-20 w-20 border-4 border-white shadow-sm">
                <AvatarImage
                  src={`https://img.usecurling.com/ppl/thumbnail?gender=${post.author.avatar}&seed=${post.id}`}
                  alt={post.author.name}
                />
                <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="text-center md:text-left">
                <h4 className="text-xl font-bold text-foreground font-heading">
                  {post.author.name}
                </h4>
                <p className="text-primary font-medium mb-3 text-sm">
                  {post.author.role}
                </p>
                <p className="text-gray-600 text-sm leading-relaxed max-w-lg">
                  Especialista em soluções energéticas com mais de 10 anos de
                  mercado. Acredita que a energia limpa deve ser acessível para
                  todos os brasileiros.
                </p>
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="mt-16 bg-cta text-white rounded-2xl p-10 text-center relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-3xl font-bold mb-4 font-heading">
                  Gostou das dicas?
                </h3>
                <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                  Aplique o que você aprendeu agora mesmo. Simule sua economia e
                  comece a pagar menos na conta de luz.
                </p>
                <Button
                  size="lg"
                  onClick={handleSimular}
                  className="bg-white text-cta hover:bg-gray-100 font-bold text-lg px-10 py-6 rounded-full shadow-lg"
                >
                  SIMULAR ECONOMIA
                </Button>
              </div>
              <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <Zap className="h-96 w-96 absolute -top-20 -right-20 rotate-12" />
              </div>
            </div>
          </div>

          {/* Sidebar Column */}
          <aside className="lg:w-[30%] relative">
            <BlogSidebar />
          </aside>
        </div>

        {/* Related Articles */}
        <section className="mt-24 pt-12 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
            <div>
              <h3 className="text-2xl font-bold font-heading text-foreground mb-2">
                Recomendados para você
              </h3>
              <p className="text-gray-500">
                Continue sua jornada de economia com estes artigos.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => (window.location.href = '/blog')}
            >
              Ver todos os artigos
            </Button>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {relatedPosts.map((related) => (
              <ArticleCard key={related.id} post={related} />
            ))}
          </div>
        </section>
      </div>

      {/* Newsletter at bottom of post */}
      <NewsletterSignup />
    </div>
  )
}
