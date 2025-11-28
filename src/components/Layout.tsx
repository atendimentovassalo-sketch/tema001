/* Layout Component - A component that wraps the main content of the app
   - Use this file to add a header, footer, or other elements that should be present on every page
   - This component is used in the App.tsx file to wrap the main content of the app */

import { Outlet, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Menu } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

export default function Layout() {
  const [scrolled, setScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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

  const scrollToSimulator = () => {
    setIsMobileMenuOpen(false)
    const simulatorElement = document.getElementById('simulator')
    if (simulatorElement) {
      simulatorElement.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const NavLinks = () => (
    <>
      <Link
        to="#"
        className="text-gray-700 hover:text-primary font-medium transition-colors"
      >
        Sobre Nós
      </Link>
      <Link
        to="#"
        className="text-gray-700 hover:text-primary font-medium transition-colors"
      >
        Blog
      </Link>
      <Link
        to="#"
        className="text-gray-700 hover:text-primary font-medium transition-colors"
      >
        Ajuda
      </Link>
    </>
  )

  return (
    <main className="flex flex-col min-h-screen font-body text-foreground bg-background">
      {/* Header */}
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out px-4 md:px-8 h-[80px] flex items-center justify-between',
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100'
            : 'bg-white/50 backdrop-blur-sm',
        )}
      >
        <div className="container mx-auto max-w-7xl flex items-center justify-between w-full">
          {/* Logo (Left) */}
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
            <span className="text-xl md:text-2xl font-bold tracking-tight text-primary font-heading">
              iGreen<span className="text-foreground">Energy</span>
            </span>
          </button>

          {/* Desktop Navigation (Center) */}
          <nav className="hidden md:flex items-center gap-8">
            <NavLinks />
          </nav>

          {/* Desktop Action Area (Right) */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="#"
              className="text-primary font-bold hover:text-primary/80 transition-colors"
            >
              Seja um Licenciado
            </Link>
            <Button
              onClick={scrollToSimulator}
              className="bg-cta hover:bg-cta/90 text-white font-bold px-6 py-2.5 rounded-md shadow-md transition-all hover:shadow-lg hover:scale-105"
            >
              SIMULAR ECONOMIA
            </Button>
          </div>

          {/* Mobile Menu Trigger */}
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-foreground">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader className="mb-8 text-left">
                  <SheetTitle className="flex items-center gap-2">
                    <img
                      src="https://img.usecurling.com/i?q=energy%20bolt&color=green&shape=fill"
                      alt="Logo Energia"
                      className="h-6 w-6"
                    />
                    <span className="font-bold text-primary">
                      iGreen<span className="text-foreground">Energy</span>
                    </span>
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-4 text-lg">
                    <NavLinks />
                    <Link
                      to="#"
                      className="text-primary font-bold hover:text-primary/80 transition-colors"
                    >
                      Seja um Licenciado
                    </Link>
                  </div>
                  <div className="mt-4">
                    <Button
                      onClick={scrollToSimulator}
                      className="w-full bg-cta hover:bg-cta/90 text-white font-bold py-6 text-lg shadow-md"
                    >
                      SIMULAR ECONOMIA
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
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
              iGreen Energy &copy; {new Date().getFullYear()}
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
