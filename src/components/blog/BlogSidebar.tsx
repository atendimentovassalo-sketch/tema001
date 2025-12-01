import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { blogPosts } from '@/data/blog-data'
import { ArrowRight, TrendingUp, Users, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'

export function BlogSidebar() {
  const popularPosts = blogPosts.slice(0, 4)

  return (
    <div className="space-y-8 sticky top-[120px]">
      {/* Widget 1: Simulator */}
      <Card className="border-primary/20 bg-green-50/50 shadow-sm overflow-hidden">
        <div className="h-2 bg-primary w-full" />
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-bold text-primary">
            <Zap className="h-5 w-5" />
            Simule sua Economia
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Descubra em segundos quanto você deixa de pagar para a
            concessionária.
          </p>
          <div className="space-y-2">
            <Label htmlFor="bill-value" className="sr-only">
              Valor da conta
            </Label>
            <Input
              id="bill-value"
              placeholder="Valor da sua conta (R$)"
              type="number"
              className="bg-white"
            />
          </div>
          <Button className="w-full bg-cta hover:bg-cta/90 text-white font-bold shadow-md">
            VER DESCONTO
          </Button>
        </CardContent>
      </Card>

      {/* Widget 2: Refer & Earn */}
      <div className="bg-gray-900 rounded-xl p-6 text-white relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Users className="h-24 w-24" />
        </div>
        <h3 className="text-xl font-bold mb-2 relative z-10">
          Indique & Ganhe
        </h3>
        <p className="text-sm text-gray-300 mb-6 relative z-10">
          Transforme sua rede de contatos em uma fonte de renda recorrente. Seja
          um licenciado.
        </p>
        <Button
          variant="outline"
          className="w-full border-white text-primary hover:bg-white hover:text-primary font-bold relative z-10"
        >
          QUERO LUCRAR
        </Button>
      </div>

      {/* Widget 3: Most Read */}
      <Card className="border-gray-100 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-bold">
            <TrendingUp className="h-5 w-5 text-primary" />
            Mais Lidos
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <ul className="divide-y divide-gray-100">
            {popularPosts.map((post, index) => (
              <li key={post.id}>
                <Link
                  to={`/blog/${post.slug}`}
                  className="block px-6 py-4 hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl font-bold text-gray-200 group-hover:text-primary/50 font-heading">
                      0{index + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </p>
                      <span className="text-xs text-gray-400 mt-1 block">
                        {post.readTime} de leitura
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
