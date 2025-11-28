import { useEffect, useRef, useState } from 'react'

interface UseIntersectionObserverProps {
  threshold?: number
  root?: Element | null
  rootMargin?: string
  freezeOnceVisible?: boolean
}

export function useIntersectionObserver({
  threshold = 0.1,
  root = null,
  rootMargin = '0%',
  freezeOnceVisible = true,
}: UseIntersectionObserverProps = {}) {
  const [entry, setEntry] = useState<IntersectionObserverEntry>()
  const [frozen, setFrozen] = useState(false)
  const node = useRef<HTMLElement | null>(null)

  const frozenEntry = entry
  const isVisible = !!frozenEntry?.isIntersecting

  useEffect(() => {
    const element = node.current
    if (!element || (frozen && freezeOnceVisible)) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setEntry(entry)
        if (entry.isIntersecting && freezeOnceVisible) {
          setFrozen(true)
        }
      },
      { threshold, root, rootMargin },
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [threshold, root, rootMargin, frozen, freezeOnceVisible])

  return { ref: node, isVisible, entry }
}
