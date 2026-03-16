import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FilePlus2, FolderOpen } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useMainStore } from '@/stores/main'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'

export default function Dashboard() {
  const navigate = useNavigate()
  const { folders, templates, createFolder, startNewProject } = useMainStore()
  const { profile } = useAuth()

  const isViewer = profile?.role === 'Viewer' || profile?.role === 'Visualizador'

  const [isOpen, setIsOpen] = useState(false)
  const [folderId, setFolderId] = useState(folders[0]?.id || '')
  const [newFolderName, setNewFolderName] = useState('')
  const [projectName, setProjectName] = useState('')
  const [versionName, setVersionName] = useState('Versão Inicial')
  const [templateId, setTemplateId] = useState('')

  const handleCreate = () => {
    let targetFolder = folderId
    if (folderId === 'new') {
      if (!newFolderName.trim()) return
      targetFolder = createFolder(newFolderName.trim())
    }
    if (!projectName.trim() || !targetFolder) return

    startNewProject(
      targetFolder,
      projectName.trim(),
      versionName.trim() || 'Versão Inicial',
      templateId || undefined,
    )
    setIsOpen(false)
    navigate('/precificacao')
  }

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto mt-4 w-full">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Bem-vindo(a) ao Sistema</h2>
        <p className="text-muted-foreground mt-1">O que você gostaria de fazer hoje?</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card
          className={cn(
            'group transition-all bg-gradient-to-br from-background to-primary/5',
            isViewer
              ? 'opacity-60 cursor-not-allowed border-muted'
              : 'cursor-pointer hover:border-primary/50 hover:shadow-md',
          )}
          onClick={() => !isViewer && setIsOpen(true)}
        >
          <CardHeader className="flex flex-col items-center justify-center text-center p-10 h-full min-h-[280px]">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <FilePlus2 className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl mb-2">Nova Precificação</CardTitle>
            <CardDescription className="text-base max-w-xs">
              {isViewer
                ? 'Você não possui permissão para criar novos projetos.'
                : 'Crie um novo projeto do zero, defina margens e simule diferentes cenários.'}
            </CardDescription>
          </CardHeader>
        </Card>

        <Card
          className="group cursor-pointer hover:border-primary/50 transition-all hover:shadow-md bg-gradient-to-br from-background to-secondary/20"
          onClick={() => navigate('/projetos')}
        >
          <CardHeader className="flex flex-col items-center justify-center text-center p-10 h-full min-h-[280px]">
            <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <FolderOpen className="h-8 w-8 text-secondary-foreground" />
            </div>
            <CardTitle className="text-2xl mb-2">Abrir Existentes</CardTitle>
            <CardDescription className="text-base max-w-xs">
              Acesse suas pastas, gerencie projetos salvos e compare versões anteriores.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Projeto de Precificação</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Selecione a Pasta</Label>
              <select
                value={folderId}
                onChange={(e) => setFolderId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="" disabled>
                  Selecione uma pasta...
                </option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
                <option value="new">+ Criar Nova Pasta</option>
              </select>
            </div>

            {folderId === 'new' && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                <Label>Nome da Nova Pasta</Label>
                <Input
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Ex: Clientes Enterprise"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Template (Opcional)</Label>
              <select
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Sem Template (Padrão)</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Nome do Projeto</Label>
              <Input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Ex: Proposta Corporativa XPTO"
              />
            </div>

            <div className="space-y-2">
              <Label>Nome da Versão Inicial (Opcional)</Label>
              <Input
                value={versionName}
                onChange={(e) => setVersionName(e.target.value)}
                placeholder="Versão Inicial"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!projectName.trim() || (folderId === 'new' && !newFolderName.trim())}
            >
              Criar Projeto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
