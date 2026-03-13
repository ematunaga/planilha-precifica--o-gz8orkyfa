import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import useAuthStore from '@/stores/auth'
import { Package2 } from 'lucide-react'
import { toast } from 'sonner'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { loginUser } = useAuthStore()
  const navigate = useNavigate()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (email && password) {
      const res = loginUser(email, password)
      if (res.success) {
        navigate('/')
      } else {
        toast.error(res.message)
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-background p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent dark:from-primary/10 -z-10" />
      <Card className="w-full max-w-md shadow-xl border-primary/10 animate-in fade-in zoom-in-95 duration-500">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="flex justify-center mb-2">
            <div className="flex aspect-square size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
              <Package2 className="size-7" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Precificação Inteligente
          </CardTitle>
          <CardDescription>Faça login para acessar seus projetos e simulações.</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Esqueceu a senha?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11"
              />
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-4">
            <Button type="submit" className="w-full h-11 text-base font-semibold shadow-sm">
              Entrar no Sistema
            </Button>
            <div className="text-center text-sm">
              Não tem uma conta?{' '}
              <Link to="/register" className="font-semibold text-primary hover:underline">
                Criar Conta
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
