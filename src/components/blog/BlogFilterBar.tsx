import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

interface BlogFilterBarProps {
  categories: string[]
  selectedCategory: string
  onSelectCategory: (category: string) => void
}

export function BlogFilterBar({
  categories,
  selectedCategory,
  onSelectCategory,
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
        <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0 no-scrollbar scroll-smooth">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? 'default' : 'outline'}
              onClick={() => onSelectCategory(cat)}
              className={cn(
                'rounded-full whitespace-nowrap transition-all duration-200',
                selectedCategory === cat
                  ? 'bg-primary text-white shadow-md hover:bg-primary/90'
                  : 'text-gray-600 border-gray-300 hover:border-primary hover:text-primary bg-transparent',
              )}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
