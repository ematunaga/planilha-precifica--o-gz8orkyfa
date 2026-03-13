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
import { Package2, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const navigate = useNavigate()

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      toast.success(`Um link de recuperação foi enviado para ${email}.`)
      setTimeout(() => navigate('/login'), 2000)
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
          <CardTitle className="text-2xl font-bold tracking-tight">Recuperar Senha</CardTitle>
          <CardDescription>
            Informe seu email e enviaremos um link para redefinir sua senha.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleReset}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Cadastrado</Label>
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
          </CardContent>
          <CardFooter className="flex-col gap-4">
            <Button type="submit" className="w-full h-11 text-base font-semibold shadow-sm">
              Enviar Link de Recuperação
            </Button>
            <div className="text-center w-full">
              <Button variant="ghost" asChild className="w-full h-11">
                <Link to="/login">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para o Login
                </Link>
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
