import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { MainStoreProvider } from '@/stores/main'
import { AuthProvider, useAuth } from '@/hooks/use-auth'
import Layout from '@/components/Layout'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import ForgotPassword from '@/pages/ForgotPassword'
import Dashboard from '@/pages/Dashboard'
import Projetos from '@/pages/Projetos'
import Pricing from '@/pages/Pricing'
import Simulador from '@/pages/Simulador'
import Produtos from '@/pages/Produtos'
import Configuracoes from '@/pages/Configuracoes'
import Users from '@/pages/Users'
import NotFound from '@/pages/NotFound'
import { AlertCircle, Lock } from 'lucide-react'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading, profile } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-background">
        Carregando...
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (profile?.status === 'Pending') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-background p-4 text-center">
        <div className="bg-card p-8 rounded-xl shadow-xl border border-primary/10 max-w-md animate-in fade-in slide-in-from-bottom-4">
          <Lock className="w-12 h-12 text-primary mx-auto mb-4 opacity-50" />
          <h2 className="text-2xl font-bold mb-2">Conta Pendente</h2>
          <p className="text-muted-foreground">
            Sua conta foi criada e está aguardando autorização de um administrador.
          </p>
        </div>
      </div>
    )
  }

  if (profile?.status === 'Revoked') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-background p-4 text-center">
        <div className="bg-card p-8 rounded-xl shadow-xl border border-destructive/20 max-w-md animate-in fade-in slide-in-from-bottom-4">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4 opacity-80" />
          <h2 className="text-2xl font-bold mb-2 text-destructive">Acesso Revogado</h2>
          <p className="text-muted-foreground">
            Seu acesso ao sistema foi revogado. Por favor, contate o administrador.
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/projetos" element={<Projetos />} />
        <Route path="/precificacao" element={<Pricing />} />
        <Route path="/simulador" element={<Simulador />} />
        <Route path="/produtos" element={<Produtos />} />
        <Route path="/configuracoes" element={<Configuracoes />} />
        <Route path="/users" element={<Users />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

const App = () => (
  <AuthProvider>
    <MainStoreProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppRoutes />
        </TooltipProvider>
      </BrowserRouter>
    </MainStoreProvider>
  </AuthProvider>
)

export default App
