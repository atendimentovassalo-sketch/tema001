/* Main App Component - Handles routing (using react-router-dom), query client and other providers - use this file to add all routes */
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import NotFound from './pages/NotFound'
import MemorialPage from './pages/memorial/MemorialPage'
import NovoMemorial from './pages/memorial/NovoMemorial'
import Obituario from './pages/memorial/Obituario'
import AprovarHomenagem from './pages/memorial/AprovarHomenagem'
import HomeV2 from './pages/memorial/HomeV2'
import AdminLogin from './pages/admin/Login'
import AdminPainel from './pages/admin/Painel'
import AdminConfig from './pages/admin/Configuracoes'
import AdminUsuarios from './pages/admin/Usuarios'
import AdminClientes from './pages/admin/Clientes'
import AdminFinanceiro from './pages/admin/Financeiro'
import AdminRecuperar from './pages/admin/Recuperar'
import Privacidade from './pages/legal/Privacidade'
import Termos from './pages/legal/Termos'

// ONLY IMPORT AND RENDER WORKING PAGES, NEVER ADD PLACEHOLDER COMPONENTS OR PAGES IN THIS FILE
// AVOID REMOVING ANY CONTEXT PROVIDERS FROM THIS FILE (e.g. TooltipProvider, Toaster, Sonner)

const App = () => (
  <BrowserRouter
    future={{ v7_startTransition: false, v7_relativeSplatPath: false }}
  >
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Routes>
        {/* Memorial (tema próprio) */}
        <Route path="/funeraria" element={<HomeV2 />} />
        <Route path="/obituario" element={<Obituario />} />
        <Route path="/m/:slug" element={<MemorialPage />} />
        <Route path="/memorial/novo" element={<NovoMemorial />} />
        <Route path="/aprovar/:token" element={<AprovarHomenagem />} />
        {/* Painel administrativo da funerária */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/recuperar" element={<AdminRecuperar />} />
        <Route path="/admin" element={<AdminPainel />} />
        <Route path="/admin/config" element={<AdminConfig />} />
        <Route path="/admin/usuarios" element={<AdminUsuarios />} />
        <Route path="/admin/clientes" element={<AdminClientes />} />
        <Route path="/admin/financeiro" element={<AdminFinanceiro />} />
        {/* Páginas legais (LGPD) */}
        <Route path="/privacidade" element={<Privacidade />} />
        <Route path="/termos" element={<Termos />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  </BrowserRouter>
)

export default App
