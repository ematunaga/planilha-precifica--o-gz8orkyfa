import { useState } from 'react'
import { DollarSign, LogOut, Key } from 'lucide-react'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useMainStore } from '@/stores/main'
import { useAuth } from '@/hooks/use-auth'
import { useNavigate } from 'react-router-dom'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export function AppHeader() {
  const { exchangeRate, setExchangeRate } = useMainStore()
  const { profile, signOut, changePassword } = useAuth()
  const navigate = useNavigate()

  const [isPwdOpen, setIsPwdOpen] = useState(false)
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  const handlePwdChange = async () => {
    if (newPwd !== confirmPwd) {
      toast.error('As novas senhas não coincidem.')
      return
    }
    const { error } = await changePassword(newPwd)
    if (!error) {
      toast.success('Senha alterada com sucesso!')
      setIsPwdOpen(false)
      setNewPwd('')
      setConfirmPwd('')
    } else {
      toast.error(error.message || 'Erro ao alterar a senha.')
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-2 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div className="hidden h-6 w-px bg-border md:block" />
        <h1 className="text-sm font-medium hidden sm:block">Painel de Precificação</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-1.5 shadow-sm">
          <DollarSign className="size-4 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground hidden sm:inline">
            Câmbio (USD):
          </span>
          <Input
            type="number"
            step="0.01"
            value={exchangeRate}
            onChange={(e) => setExchangeRate(parseFloat(e.target.value) || 0)}
            className="h-6 w-16 border-none bg-transparent p-0 text-xs font-bold focus-visible:ring-0 text-right"
            title="Cotação PTAX"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-9 w-9 rounded-full border border-border shadow-sm bg-background"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                  {profile?.name ? profile.name.charAt(0).toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{profile?.name}</p>
                <p className="text-xs leading-none text-muted-foreground">{profile?.email}</p>
                <div className="mt-2 pt-1">
                  <Badge
                    variant="secondary"
                    className="text-[10px] uppercase font-semibold tracking-wider px-2"
                  >
                    {profile?.role}
                  </Badge>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setIsPwdOpen(true)} className="cursor-pointer">
              <Key className="mr-2 h-4 w-4" />
              <span>Trocar Senha</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair do sistema</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={isPwdOpen} onOpenChange={setIsPwdOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Trocar Senha</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nova Senha</Label>
              <Input
                type="password"
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                placeholder="Digite a nova senha"
              />
            </div>
            <div className="space-y-2">
              <Label>Confirmar Nova Senha</Label>
              <Input
                type="password"
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
                placeholder="Confirme a nova senha"
                onKeyDown={(e) => e.key === 'Enter' && handlePwdChange()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPwdOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handlePwdChange} disabled={!newPwd || !confirmPwd}>
              Salvar Senha
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  )
}
