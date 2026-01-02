import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Search, X } from 'lucide-react'
import { useEffect, useState } from 'react'

interface BlogFilterBarProps {
  categories: string[]
  selectedCategory: string
  onSelectCategory: (category: string) => void
  searchQuery: string
  onSearchQueryChange: (query: string) => void
}

export function BlogFilterBar({
  categories,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchQueryChange,
}: BlogFilterBarProps) {
  const [isSticky, setIsSticky] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY
      // Adjust 500 based on Hero height approx
      if (offset > 450) {
        setIsSticky(true)
      } else {
        setIsSticky(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div
      className={cn(
        'w-full z-40 transition-all duration-300 border-b border-gray-100 bg-white py-4',
        isSticky ? 'sticky top-[80px] shadow-sm' : 'relative',
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-4 justify-between">
          {/* Categories */}
          <div className="w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar scroll-smooth">
            <div className="flex items-center gap-2 md:gap-3 min-w-max">
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? 'default' : 'outline'}
                  onClick={() => onSelectCategory(cat)}
                  className={cn(
                    'rounded-full whitespace-nowrap transition-all duration-200 h-9 px-4 text-sm font-medium',
                    selectedCategory === cat
                      ? 'bg-primary text-white shadow-md hover:bg-primary/90 border-primary'
                      : 'text-gray-600 border-gray-200 hover:border-primary hover:text-primary bg-transparent',
                  )}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>

          {/* Search Bar */}
          <div className="w-full md:w-72 relative group">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
            </div>
            <Input
              type="text"
              placeholder="Buscar artigos..."
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              className="pl-10 pr-10 rounded-full border-gray-200 bg-gray-50 focus:bg-white focus:border-primary transition-all duration-200 shadow-sm hover:shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchQueryChange('')}
                className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Limpar busca</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
