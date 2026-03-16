import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { ShieldCheck, UserX, MailPlus } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { fetchUsers, fetchInvitations, updateUserRoleAndStatus, inviteUser } from '@/services/users'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'

export default function Users() {
  const { profile } = useAuth()
  const [users, setUsers] = useState<any[]>([])
  const [invitations, setInvitations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('Visualizador')
  const [inviting, setInviting] = useState(false)

  const loadData = async () => {
    try {
      const [u, i] = await Promise.all([fetchUsers(), fetchInvitations()])
      setUsers(u)
      setInvitations(i)
    } catch (e) {
      toast.error('Erro ao carregar dados.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (profile?.role === 'Admin') loadData()
  }, [profile])

  if (profile?.role !== 'Admin') {
    return <Navigate to="/" replace />
  }

  const handleUpdateStatus = async (id: string, role: string, status: string) => {
    try {
      await updateUserRoleAndStatus(id, role, status)
      toast.success('Usuário atualizado com sucesso.')
      loadData()
    } catch (e) {
      toast.error('Erro ao atualizar usuário.')
    }
  }

  const handleInvite = async () => {
    if (!inviteEmail) return
    setInviting(true)
    try {
      await inviteUser(inviteEmail, inviteRole)
      toast.success('Convite enviado com sucesso!')
      setIsInviteOpen(false)
      setInviteEmail('')
      loadData()
    } catch (e: any) {
      toast.error(e.message || 'Erro ao enviar convite. O e-mail pode já estar convidado.')
    } finally {
      setInviting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full w-full">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Gestão de Usuários</h2>
        <p className="text-muted-foreground">
          Gerencie acessos, autorizações e convites do sistema.
        </p>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <TabsList>
            <TabsTrigger value="users">Usuários Registrados</TabsTrigger>
            <TabsTrigger value="invitations">Convites Enviados</TabsTrigger>
          </TabsList>
          <Button onClick={() => setIsInviteOpen(true)} className="shadow-sm">
            <MailPlus className="w-4 h-4 mr-2" />
            Convidar Usuário
          </Button>
        </div>

        <TabsContent value="users">
          <div className="border rounded-md bg-card shadow-sm">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Perfil de Acesso</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                      Carregando usuários...
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                      Nenhum usuário encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name || 'Sem nome'}</TableCell>
                      <TableCell className="text-muted-foreground">{user.email}</TableCell>
                      <TableCell>
                        <Select
                          value={user.role === 'Viewer' ? 'Visualizador' : user.role}
                          onValueChange={(val) => handleUpdateStatus(user.id, val, user.status)}
                          disabled={user.id === profile.id}
                        >
                          <SelectTrigger className="w-[140px] h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Admin">Administrador</SelectItem>
                            <SelectItem value="Editor">Editor</SelectItem>
                            <SelectItem value="Visualizador">Visualizador</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.status === 'Authorized'
                              ? 'default'
                              : user.status === 'Pending'
                                ? 'secondary'
                                : 'destructive'
                          }
                          className={
                            user.status === 'Authorized'
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100'
                              : ''
                          }
                        >
                          {user.status === 'Authorized'
                            ? 'Autorizado'
                            : user.status === 'Pending'
                              ? 'Pendente'
                              : 'Revogado'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {user.id !== profile.id && (
                          <div className="flex justify-end gap-2">
                            {user.status !== 'Authorized' && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                                onClick={() => handleUpdateStatus(user.id, user.role, 'Authorized')}
                              >
                                <ShieldCheck className="h-4 w-4 mr-1" /> Autorizar
                              </Button>
                            )}
                            {user.status === 'Authorized' && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                                onClick={() => handleUpdateStatus(user.id, user.role, 'Revoked')}
                              >
                                <UserX className="h-4 w-4 mr-1" /> Revogar
                              </Button>
                            )}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="invitations">
          <div className="border rounded-md bg-card shadow-sm">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Perfil Solicitado</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Enviado em</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                      Nenhum convite enviado.
                    </TableCell>
                  </TableRow>
                ) : (
                  invitations.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell className="font-medium">{inv.email}</TableCell>
                      <TableCell>{inv.role === 'Viewer' ? 'Visualizador' : inv.role}</TableCell>
                      <TableCell>
                        <Badge variant={inv.status === 'Accepted' ? 'default' : 'secondary'}>
                          {inv.status === 'Accepted' ? 'Aceito' : 'Pendente'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(inv.created_at).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Convidar Novo Usuário</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Email do Usuário</Label>
              <Input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="email@empresa.com"
                disabled={inviting}
              />
            </div>
            <div className="space-y-2">
              <Label>Perfil de Acesso</Label>
              <Select value={inviteRole} onValueChange={setInviteRole} disabled={inviting}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Administrador</SelectItem>
                  <SelectItem value="Editor">Editor</SelectItem>
                  <SelectItem value="Visualizador">Visualizador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInviteOpen(false)} disabled={inviting}>
              Cancelar
            </Button>
            <Button onClick={handleInvite} disabled={!inviteEmail || inviting}>
              {inviting ? 'Enviando...' : 'Enviar Convite'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
