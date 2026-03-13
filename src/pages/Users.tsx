import { Navigate } from 'react-router-dom'
import { ShieldCheck, UserX } from 'lucide-react'
import useAuthStore from '@/stores/auth'
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
import { UserRole } from '@/types'
import { toast } from 'sonner'

export default function Users() {
  const { currentUser, users, updateUserRole, updateUserStatus } = useAuthStore()

  if (currentUser?.role !== 'Admin') {
    return <Navigate to="/" replace />
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full w-full">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Gestão de Usuários</h2>
        <p className="text-muted-foreground">
          Gerencie acessos, autorizações e perfis dos usuários no sistema.
        </p>
      </div>

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
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell className="text-muted-foreground">{user.email}</TableCell>
                <TableCell>
                  <Select
                    value={user.role}
                    onValueChange={(val) => {
                      updateUserRole(user.id, val as UserRole)
                      toast.success(`Perfil de ${user.name} alterado para ${val}`)
                    }}
                    disabled={user.id === currentUser.id}
                  >
                    <SelectTrigger className="w-[140px] h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Admin">Administrador</SelectItem>
                      <SelectItem value="Editor">Editor</SelectItem>
                      <SelectItem value="Viewer">Visualizador</SelectItem>
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
                  {user.id !== currentUser.id && (
                    <div className="flex justify-end gap-2">
                      {user.status !== 'Authorized' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                          onClick={() => {
                            updateUserStatus(user.id, 'Authorized')
                            toast.success(`Acesso concedido para ${user.name}`)
                          }}
                        >
                          <ShieldCheck className="h-4 w-4 mr-1" /> Autorizar
                        </Button>
                      )}
                      {user.status === 'Authorized' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                          onClick={() => {
                            updateUserStatus(user.id, 'Revoked')
                            toast.error(`Acesso revogado para ${user.name}`)
                          }}
                        >
                          <UserX className="h-4 w-4 mr-1" /> Revogar
                        </Button>
                      )}
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
