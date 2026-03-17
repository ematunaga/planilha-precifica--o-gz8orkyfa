import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { ShieldCheck, UserX, MailPlus, Send, Trash2, Loader2, UserPlus } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import {
  fetchUsers,
  fetchInvitations,
  updateUserRoleAndStatus,
  inviteUser,
  deleteInvitation,
  resendInvitation,
  directCreateUser,
  directDeleteUser,
} from '@/services/users'
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
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'

export default function Users() {
  const { profile } = useAuth()
  const { toast } = useToast()
  const [users, setUsers] = useState<any[]>([])
  const [invitations, setInvitations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('Visualizador')
  const [inviting, setInviting] = useState(false)

  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false)
  const [newUserName, setNewUserName] = useState('')
  const [newUserEmail, setNewUserEmail] = useState('')
  const [newUserPassword, setNewUserPassword] = useState('')
  const [newUserRole, setNewUserRole] = useState('Visualizador')
  const [creatingUser, setCreatingUser] = useState(false)

  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [invitationToDelete, setInvitationToDelete] = useState<any>(null)

  const [deleteUserDialogOpen, setDeleteUserDialogOpen] = useState(false)
  const [userToDeleteId, setUserToDeleteId] = useState<string | null>(null)
  const [deletingUser, setDeletingUser] = useState(false)

  const loadData = async () => {
    try {
      const [u, i] = await Promise.all([fetchUsers(), fetchInvitations()])
      setUsers(u)
      setInvitations(i)
    } catch (e) {
      toast({ title: 'Erro', description: 'Erro ao carregar dados.', variant: 'destructive' })
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
      toast({ title: 'Sucesso', description: 'Usuário atualizado com sucesso.' })
      loadData()
    } catch (e) {
      toast({ title: 'Erro', description: 'Erro ao atualizar usuário.', variant: 'destructive' })
    }
  }

  const handleInvite = async () => {
    if (!inviteEmail) return
    setInviting(true)
    try {
      await inviteUser(inviteEmail, inviteRole, window.location.origin)
      toast({ title: 'Sucesso', description: 'Convite enviado com sucesso!' })
      setIsInviteOpen(false)
      setInviteEmail('')
      loadData()
    } catch (e: any) {
      toast({
        title: 'Erro',
        description: e.message || 'Erro ao enviar convite.',
        variant: 'destructive',
      })
    } finally {
      setInviting(false)
    }
  }

  const handleCreateUser = async () => {
    if (!newUserName || !newUserEmail || newUserPassword.length < 6) return
    setCreatingUser(true)
    try {
      await directCreateUser(newUserEmail, newUserPassword, newUserName, newUserRole)
      toast({ title: 'Sucesso', description: 'Usuário criado com sucesso!' })
      setIsCreateUserOpen(false)
      setNewUserName('')
      setNewUserEmail('')
      setNewUserPassword('')
      setNewUserRole('Visualizador')
      loadData()
    } catch (e: any) {
      toast({
        title: 'Erro',
        description: e.message || 'Erro ao criar usuário.',
        variant: 'destructive',
      })
    } finally {
      setCreatingUser(false)
    }
  }

  const handleResend = async (inv: any) => {
    setActionLoadingId(inv.id)
    try {
      await resendInvitation(inv.email, inv.role, inv.token, window.location.origin)
      toast({ title: 'Sucesso', description: `Convite reenviado com sucesso para ${inv.email}.` })
    } catch (e: any) {
      toast({
        title: 'Erro',
        description: 'Erro ao reenviar convite. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setActionLoadingId(null)
    }
  }

  const confirmDeleteInvitation = async () => {
    if (!invitationToDelete) return
    setActionLoadingId(invitationToDelete.id)
    try {
      await deleteInvitation(invitationToDelete.id)
      toast({ title: 'Sucesso', description: 'Convite excluído com sucesso.' })
      loadData()
    } catch (e: any) {
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o convite.',
        variant: 'destructive',
      })
    } finally {
      setActionLoadingId(null)
      setDeleteDialogOpen(false)
      setInvitationToDelete(null)
    }
  }

  const handleDeleteUser = async () => {
    if (!userToDeleteId) return
    setDeletingUser(true)
    try {
      await directDeleteUser(userToDeleteId)
      toast({ title: 'Sucesso', description: 'Usuário excluído com sucesso.' })
      setDeleteUserDialogOpen(false)
      setUserToDeleteId(null)
      loadData()
    } catch (e: any) {
      toast({
        title: 'Erro',
        description: e.message || 'Não foi possível excluir o usuário.',
        variant: 'destructive',
      })
    } finally {
      setDeletingUser(false)
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
          <div className="flex gap-2 w-full sm:w-auto overflow-x-auto">
            <Button
              onClick={() => setIsCreateUserOpen(true)}
              variant="outline"
              className="shadow-sm whitespace-nowrap"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Novo Usuário
            </Button>
            <Button onClick={() => setIsInviteOpen(true)} className="shadow-sm whitespace-nowrap">
              <MailPlus className="w-4 h-4 mr-2" />
              Convidar Usuário
            </Button>
          </div>
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
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => {
                                setUserToDeleteId(user.id)
                                setDeleteUserDialogOpen(true)
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
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
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
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
                      <TableCell className="text-right">
                        {inv.status === 'Pending' && (
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8"
                              onClick={() => handleResend(inv)}
                              disabled={actionLoadingId === inv.id}
                            >
                              {actionLoadingId === inv.id ? (
                                <Loader2 className="h-4 w-4 animate-spin sm:mr-2" />
                              ) : (
                                <Send className="h-4 w-4 sm:mr-2" />
                              )}
                              <span className="hidden sm:inline">Reenviar</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => {
                                setInvitationToDelete(inv)
                                setDeleteDialogOpen(true)
                              }}
                              disabled={actionLoadingId === inv.id}
                            >
                              <Trash2 className="h-4 w-4 sm:mr-2" />
                              <span className="hidden sm:inline">Excluir</span>
                            </Button>
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
      </Tabs>

      <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Novo Usuário</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome Completo</Label>
              <Input
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                placeholder="João da Silva"
                disabled={creatingUser}
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                placeholder="email@empresa.com"
                disabled={creatingUser}
              />
            </div>
            <div className="space-y-2">
              <Label>Senha</Label>
              <Input
                type="password"
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                disabled={creatingUser}
              />
            </div>
            <div className="space-y-2">
              <Label>Perfil de Acesso</Label>
              <Select value={newUserRole} onValueChange={setNewUserRole} disabled={creatingUser}>
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
            <Button
              variant="outline"
              onClick={() => setIsCreateUserOpen(false)}
              disabled={creatingUser}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateUser}
              disabled={!newUserName || !newUserEmail || newUserPassword.length < 6 || creatingUser}
            >
              {creatingUser ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Criando...
                </>
              ) : (
                'Criar Usuário'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              {inviting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enviando...
                </>
              ) : (
                'Enviar Convite'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Convite</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-sm text-muted-foreground">
            Tem certeza que deseja excluir o convite para{' '}
            <strong className="text-foreground">{invitationToDelete?.email}</strong>? Esta ação não
            pode ser desfeita e o link enviado não funcionará mais.
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={!!actionLoadingId}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteInvitation}
              disabled={!!actionLoadingId}
            >
              {actionLoadingId ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Excluindo...
                </>
              ) : (
                'Excluir Convite'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteUserDialogOpen} onOpenChange={setDeleteUserDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Usuário</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingUser}>Cancelar</AlertDialogCancel>
            <Button variant="destructive" onClick={handleDeleteUser} disabled={deletingUser}>
              {deletingUser ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Excluindo...
                </>
              ) : (
                'Confirmar Exclusão'
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
