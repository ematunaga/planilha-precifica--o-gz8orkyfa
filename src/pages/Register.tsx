import { useState, useEffect } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
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
import { Package2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/use-auth'
import { checkInvitation, acceptInvitation } from '@/services/users'

export default function Register() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [invitation, setInvitation] = useState<any>(null)

  const navigate = useNavigate()
  const { signUp } = useAuth()

  useEffect(() => {
    if (token) {
      checkInvitation(token).then((data) => {
        if (data && data.status === 'Pending') {
          setInvitation(data)
          setEmail(data.email)
          toast.success(`Convite identificado para ${data.email}!`)
        } else {
          toast.error('Convite inválido ou já utilizado.')
        }
      })
    }
  }, [token])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.includes('@')) {
      toast.error('Por favor, insira um email válido.')
      return
    }

    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem.')
      return
    }

    const role = invitation ? invitation.role : 'Visualizador'
    const status = invitation ? 'Authorized' : 'Pending'

    const { error } = await signUp(email, password, { name, role, status })

    if (error) {
      toast.error(error.message || 'Erro ao criar conta.')
    } else {
      if (invitation) {
        await acceptInvitation(token!)
      }
      toast.success(
        invitation
          ? 'Conta criada e autorizada com sucesso!'
          : 'Conta criada! Aguarde a autorização de um administrador.',
      )
      navigate('/login')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-background p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent dark:from-primary/10 -z-10" />
      <Card className="w-full max-w-md shadow-xl border-primary/10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="flex justify-center mb-2">
            <div className="flex aspect-square size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
              <Package2 className="size-7" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Criar Nova Conta</CardTitle>
          <CardDescription>
            {invitation
              ? 'Complete seu cadastro a partir do convite.'
              : 'Cadastre-se para começar a precificar.'}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleRegister}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                type="text"
                placeholder="João da Silva"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="joao@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={!!invitation}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
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
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="h-11"
              />
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-4">
            <Button type="submit" className="w-full h-11 text-base font-semibold shadow-sm">
              Criar Conta
            </Button>
            <div className="text-center text-sm">
              Já tem uma conta?{' '}
              <Link to="/login" className="font-semibold text-primary hover:underline">
                Fazer Login
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
