import { useEffect, useState, useRef, RefObject } from 'react'

export function useInView(
  options: IntersectionObserverInit = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1,
  },
): [RefObject<HTMLDivElement | null>, boolean] {
  const ref = useRef<HTMLDivElement>(null)
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true)
        observer.disconnect()
      }
    }, options)

    const currentRef = ref.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [options])

  return [ref, isInView]
}
