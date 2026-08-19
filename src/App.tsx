/* Main App Component - Handles routing (using react-router-dom), query client and other providers - use this file to add all routes */
import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'

/* CARREGAMENTO IMEDIATO — o que o VISITANTE abre.
 *
 * Quem chega aqui recebeu o link no WhatsApp, está no celular, muitas vezes com
 * sinal ruim e no meio de um velório. Essas telas não podem depender de um
 * segundo download para começar a aparecer. */
import NotFound from './pages/NotFound'
import MemorialPage from './pages/memorial/MemorialPage'
import Obituario from './pages/memorial/Obituario'
import HomeV2 from './pages/memorial/HomeV2'
import Privacidade from './pages/legal/Privacidade'
import Termos from './pages/legal/Termos'

/* SOB DEMANDA — o que só a funerária (ou a família com link) abre.
 *
 * O painel inteiro estava no mesmo arquivo que o memorial: quem visitava a nota
 * de um falecido baixava o cadastro de clientes, o financeiro, o editor e as
 * configurações junto. São telas de quem já está logado, no computador da
 * funerária, e podem custar um instante a mais. */
const NovoMemorial = lazy(() => import('./pages/memorial/NovoMemorial'))
const AprovarHomenagem = lazy(() => import('./pages/memorial/AprovarHomenagem'))
const AreaFamilia = lazy(() => import('./pages/memorial/AreaFamilia'))
const PreviaFamilia = lazy(() => import('./pages/memorial/PreviaFamilia'))
const AdminLogin = lazy(() => import('./pages/admin/Login'))
const AdminPainel = lazy(() => import('./pages/admin/Painel'))
const AdminConfig = lazy(() => import('./pages/admin/Configuracoes'))
const AdminUsuarios = lazy(() => import('./pages/admin/Usuarios'))
const AdminClientes = lazy(() => import('./pages/admin/Clientes'))
const AdminFinanceiro = lazy(() => import('./pages/admin/Financeiro'))
const AdminRecuperar = lazy(() => import('./pages/admin/Recuperar'))

// ONLY IMPORT AND RENDER WORKING PAGES, NEVER ADD PLACEHOLDER COMPONENTS OR PAGES IN THIS FILE
// AVOID REMOVING ANY CONTEXT PROVIDERS FROM THIS FILE (e.g. TooltipProvider, Toaster, Sonner)

const App = () => (
  <BrowserRouter
    future={{ v7_startTransition: false, v7_relativeSplatPath: false }}
  >
    <TooltipProvider>
      {/* Só o Sonner. O <Toaster/> do Radix estava montado aqui sem nenhum
          consumidor: os únicos arquivos que chamavam `useToast` eram resíduo do
          template iGreen, cujas rotas saíram em 09/08. Custava ~26 KB de fonte
          para não fazer nada. */}
      <Sonner />
      <Suspense fallback={<div />}>
        <Routes>
          {/* Memorial (tema próprio) */}
          <Route path="/funeraria" element={<HomeV2 />} />
          <Route path="/obituario" element={<Obituario />} />
          <Route path="/m/:slug" element={<MemorialPage />} />
          <Route path="/memorial/novo" element={<NovoMemorial />} />
          <Route path="/aprovar/:token" element={<AprovarHomenagem />} />
          {/* Sob /memorial/ de propósito: no domínio da funerária, quem passa
            pelo Worker são /obituario*, /m/*, /memorial/*, /admin*, /api/* e
            /assets/*. Um caminho /familia/* na raiz cairia no site estático —
            testado em 18/08/2026. Mexer na lista de rotas do Worker para abrir
            um caminho novo é o tipo de alteração que derruba o site da cliente
            se sair errada; usar um prefixo já roteado não custa nada. */}
          <Route path="/memorial/familia/:token" element={<AreaFamilia />} />
          <Route
            path="/memorial/familia/:token/previa"
            element={<PreviaFamilia />}
          />
          {/* Compatibilidade: em hosts onde a raiz é roteada (pages.dev), o
            caminho curto também funciona. */}
          <Route path="/familia/:token" element={<AreaFamilia />} />
          <Route path="/familia/:token/previa" element={<PreviaFamilia />} />
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
      </Suspense>
    </TooltipProvider>
  </BrowserRouter>
)

export default App
