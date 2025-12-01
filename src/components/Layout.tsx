import { Link } from 'react-router-dom'
import { Zap, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

const Layout = ({ children }: { children?: React.ReactNode }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const NavLinks = ({ mobile = false }) => (
    <>
      <Link
        to="/"
        className={`${mobile ? 'text-lg font-medium py-2' : 'text-sm font-medium text-muted-foreground hover:text-primary transition-colors'}`}
      >
        Início
      </Link>
      <a
        href="#como-funciona"
        className={`${mobile ? 'text-lg font-medium py-2' : 'text-sm font-medium text-muted-foreground hover:text-primary transition-colors'}`}
      >
        Como Funciona
      </a>
      <a
        href="#simulador"
        className={`${mobile ? 'text-lg font-medium py-2' : 'text-sm font-medium text-muted-foreground hover:text-primary transition-colors'}`}
      >
        Simulador
      </a>
      <a
        href="#depoimentos"
        className={`${mobile ? 'text-lg font-medium py-2' : 'text-sm font-medium text-muted-foreground hover:text-primary transition-colors'}`}
      >
        Depoimentos
      </a>
    </>
  )

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary fill-primary" />
            <span className="font-bold text-xl tracking-tight text-primary">
              EcoLuz
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <NavLinks />
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Button variant="outline" className="font-semibold">
              Login
            </Button>
            <Button className="font-semibold">Começar Agora</Button>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col gap-4 mt-8">
                  <NavLinks mobile />
                  <div className="flex flex-col gap-2 mt-4">
                    <Button variant="outline" className="w-full">
                      Login
                    </Button>
                    <Button className="w-full">Começar Agora</Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {children}
        {/* Usually Outlet is here, but if Layout is used as a wrapper in Route, children might be null and Outlet used instead. 
            However, in App.tsx provided: <Route element={<Layout />}><Route ... /></Route>.
            In that case, Layout should render <Outlet />. 
            But the provided code uses `children` prop. 
            I should update it to use Outlet if it's a Layout Route wrapper.
            Let's import Outlet.
        */}
        <div className="flex-1">
          {/* Check if children is passed, if not use Outlet. For Router Route wrapper, Outlet is used. */}
          {children}
          {/* I need to import Outlet from react-router-dom if this is a layout route */}
          <import_outlet_check />
        </div>
      </main>

      <footer className="border-t bg-muted/30">
        <div className="container py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Zap className="h-6 w-6 text-primary fill-primary" />
                <span className="font-bold text-xl text-primary">EcoLuz</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Transformando a maneira como você consome energia. Mais barato,
                mais limpo, mais inteligente.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Empresa</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link to="#" className="hover:text-primary">
                    Sobre nós
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-primary">
                    Carreiras
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-primary">
                    Imprensa
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Recursos</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link to="#" className="hover:text-primary">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-primary">
                    Central de Ajuda
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-primary">
                    Termos de Uso
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Contato</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>contato@ecoluz.com.br</li>
                <li>0800 123 4567</li>
                <li>São Paulo, SP</li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 EcoLuz. Todos os direitos reservados.
            </p>
            <div className="flex gap-4">{/* Social icons placeholders */}</div>
          </div>
        </div>
      </footer>
    </div>
  )
}

import { Outlet } from 'react-router-dom'

// Fixing the component to properly work with React Router
const RouterLayout = () => {
  return (
    <Layout>
      <Outlet />
    </Layout>
  )
}

export default RouterLayout
