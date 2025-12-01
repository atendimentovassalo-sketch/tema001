import { Button } from '@/components/ui/button'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

interface BlogHeroProps {
  title: string
  subtitle: string
  ctaText: string
  ctaLink: string
  bgImage: string
}

export function BlogHero({
  title,
  subtitle,
  ctaText,
  ctaLink,
  bgImage,
}: BlogHeroProps) {
  return (
    <section className="relative w-full h-[500px] md:h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={bgImage}
          alt="Hero Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-transparent" />
      </div>

      <div className="container relative z-10 px-4 mx-auto h-full flex flex-col justify-center">
        <div className="mb-6">
          <Breadcrumb>
            <BreadcrumbList className="text-gray-300">
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/" className="hover:text-white transition-colors">
                    Home
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-primary font-semibold">
                  Portal de Inteligência
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="max-w-3xl animate-fade-in-up">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 leading-tight font-heading">
            {title}
          </h1>
          <h2 className="text-xl md:text-2xl text-gray-200 mb-8 font-body leading-relaxed">
            {subtitle}
          </h2>
          <Button
            asChild
            size="lg"
            className="bg-primary hover:bg-primary/90 text-white font-bold text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-green-500/20 transition-all hover:scale-105"
          >
            <Link to={ctaLink}>
              {ctaText} <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
