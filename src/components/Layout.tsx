/* Layout Component - A component that wraps the main content of the app
   - Use this file to add a header, footer, or other elements that should be present on every page
   - This component is used in the App.tsx file to wrap the main content of the app */

import { Outlet } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

export default function Layout() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY
      if (offset > 50) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <main className="flex flex-col min-h-screen font-body text-foreground bg-background">
      {/* Header */}
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out px-4 md:px-8 h-[70px] flex items-center justify-between',
          scrolled
            ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100'
            : 'bg-transparent',
        )}
      >
        <div className="container mx-auto max-w-7xl flex items-center">
          <button
            onClick={scrollToTop}
            className="flex items-center gap-2 focus:outline-none group"
            aria-label="Voltar ao topo"
          >
            <img
              src="https://img.usecurling.com/i?q=energy%20bolt&color=green&shape=fill"
              alt="Logo Energia"
              className="h-8 w-8 md:h-10 md:w-10 transition-transform duration-300 group-hover:scale-105"
            />
            <span className="text-xl font-bold tracking-tight text-primary font-heading">
              Economia<span className="text-foreground">Luz</span>
            </span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-grow w-full">
        <Outlet />
      </div>

      {/* Footer */}
      <footer className="bg-[#F9F9F9] border-t border-gray-200 py-12 px-4">
        <div className="container mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <img
              src="https://img.usecurling.com/i?q=energy%20bolt&color=gray&shape=fill"
              alt="Logo Energia Footer"
              className="h-6 w-6 grayscale opacity-50"
            />
            <span className="text-sm font-semibold text-gray-500 font-body">
              EconomiaLuz &copy; {new Date().getFullYear()}
            </span>
          </div>
          <div className="flex gap-6 text-sm text-gray-500 font-body">
            <a href="#" className="hover:text-primary transition-colors">
              Termos de Uso
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Política de Privacidade
            </a>
          </div>
        </div>
      </footer>
    </main>
  )
}
