import { Quote, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'

interface ShareableQuoteProps {
  text: string
  author?: string
}

export function ShareableQuote({ text, author }: ShareableQuoteProps) {
  const handleShare = () => {
    const shareText = `"${text}" - ${author || 'iGreen Energy'}`
    navigator.clipboard.writeText(shareText)
    toast({
      title: 'Copiado!',
      description: 'Frase copiada para a área de transferência.',
      duration: 2000,
    })
  }

  return (
    <div className="my-10 relative group">
      <div className="absolute -left-2 md:-left-4 top-0 bottom-0 w-1 bg-primary rounded-full" />
      <blockquote className="pl-6 md:pl-10 pr-4 py-2 italic text-xl md:text-2xl text-gray-700 font-heading leading-relaxed bg-gray-50/50 rounded-r-lg border border-l-0 border-gray-100">
        <Quote className="h-8 w-8 text-primary/20 mb-2" />
        {text}
        {author && (
          <footer className="mt-4 text-sm font-bold text-primary not-italic font-body">
            — {author}
          </footer>
        )}
      </blockquote>
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-primary"
        onClick={handleShare}
        title="Copiar frase"
      >
        <Share2 className="h-4 w-4" />
      </Button>
    </div>
  )
}
