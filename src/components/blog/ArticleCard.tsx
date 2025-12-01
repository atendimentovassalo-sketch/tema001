import { BlogPost } from '@/data/blog-data'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, MessageCircle, Share2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface ArticleCardProps {
  post: BlogPost
}

export function ArticleCard({ post }: ArticleCardProps) {
  const shareOnWhatsApp = (e: React.MouseEvent) => {
    e.preventDefault()
    const text = `Olha esse artigo legal que eu vi na iGreen: ${post.title}`
    const url = window.location.origin + `/blog/${post.slug}`
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
      '_blank',
    )
  }

  return (
    <Link to={`/blog/${post.slug}`} className="group h-full block">
      <Card className="h-full overflow-hidden border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 bg-white flex flex-col">
        <div className="relative aspect-video overflow-hidden bg-gray-100">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute top-4 left-4">
            <Badge className="bg-primary hover:bg-primary/90 text-white font-bold px-3 py-1 shadow-sm">
              {post.category}
            </Badge>
          </div>
          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300" />
        </div>

        <CardContent className="p-6 flex-grow">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-3 font-medium uppercase tracking-wider">
            <Clock className="h-3 w-3" />
            <span>{post.readTime} de leitura</span>
          </div>
          <h3 className="text-xl font-bold text-foreground mb-3 leading-tight line-clamp-3 group-hover:text-primary transition-colors font-heading">
            {post.title}
          </h3>
          <p className="text-gray-500 text-sm line-clamp-3 font-body">
            {post.subtitle}
          </p>
        </CardContent>

        <CardFooter className="p-6 pt-0 flex justify-between items-center mt-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-400 group-hover:text-primary transition-colors">
              Ler artigo completo
            </span>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-green-50 hover:text-green-600 text-gray-400"
                onClick={shareOnWhatsApp}
              >
                <MessageCircle className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Compartilhar no WhatsApp</p>
            </TooltipContent>
          </Tooltip>
        </CardFooter>
      </Card>
    </Link>
  )
}
