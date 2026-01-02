import { useEffect } from 'react'

interface SEOProps {
  title: string
  description?: string
}

export function SEO({ title, description }: SEOProps) {
  useEffect(() => {
    // Update Title
    document.title = `${title} | iGreen Energy`

    // Update Meta Description
    if (description) {
      let metaDescription = document.querySelector('meta[name="description"]')
      if (!metaDescription) {
        metaDescription = document.createElement('meta')
        metaDescription.setAttribute('name', 'description')
        document.head.appendChild(metaDescription)
      }
      metaDescription.setAttribute('content', description)
    }

    // Cleanup usually not needed for meta description in simple SPAs unless we want to revert to default
    return () => {
      // Optional: Reset title or description on unmount if needed
    }
  }, [title, description])

  return null
}
