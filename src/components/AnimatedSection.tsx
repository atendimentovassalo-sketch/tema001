import { cn } from '@/lib/utils'
import { useInView } from '@/hooks/use-in-view'
import { ReactNode } from 'react'

interface AnimatedSectionProps {
  children: ReactNode
  className?: string
  delay?: number
}

export const AnimatedSection = ({
  children,
  className,
  delay = 0,
}: AnimatedSectionProps) => {
  const [ref, isInView] = useInView()

  return (
    <div
      ref={ref}
      className={cn(
        'transition-all duration-700 ease-out',
        isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12',
        className,
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}
