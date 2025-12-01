import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

export function ReadingProgressBar() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY
      const docHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight
      const scrollPercent = scrollTop / docHeight
      setProgress(scrollPercent * 100)
    }

    window.addEventListener('scroll', updateProgress)
    return () => window.removeEventListener('scroll', updateProgress)
  }, [])

  return (
    <div className="fixed top-0 left-0 w-full h-1.5 z-[60] bg-gray-100">
      <div
        className={cn(
          'h-full bg-primary transition-all duration-150 ease-out',
          progress > 98 ? 'rounded-none' : 'rounded-r-full',
        )}
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
