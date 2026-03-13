import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Folder, FolderPlus, FileText, ChevronRight, Trash2 } from 'lucide-react'
import { useMainStore } from '@/stores/main'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function Projetos() {
  const {
    folders,
    projects,
    versions,
    createFolder,
    deleteFolder,
    deleteProject,
    deleteVersion,
    loadVersion,
  } = useMainStore()
  const navigate = useNavigate()

  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(folders[0]?.id || null)
  const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')

  const activeFolderProjects = projects.filter((p) => p.folderId === selectedFolderId)

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      const id = createFolder(newFolderName.trim())
      setSelectedFolderId(id)
      setIsFolderDialogOpen(false)
      setNewFolderName('')
      toast.success('Pasta criada com sucesso!')
    }
  }

  const handleLoadVersion = (versionId: string) => {
    loadVersion(versionId)
    toast.success('Projeto carregado!')
    navigate('/precificacao')
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full w-full">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Meus Projetos</h2>
        <p className="text-muted-foreground">
          Gerencie suas pastas, projetos e histórico de versões.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 flex-1 items-start">
        {/* Folders Sidebar */}
        <Card className="md:col-span-4 lg:col-span-3 flex flex-col h-full sticky top-20 shadow-sm border-border">
          <div className="p-4 border-b bg-muted/20 flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <Folder className="h-4 w-4" /> Pastas
            </h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsFolderDialogOpen(true)}
              title="Nova Pasta"
            >
              <FolderPlus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {folders.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground text-center">
                Nenhuma pasta criada.
              </div>
            ) : (
              folders.map((folder) => (
                <div
                  key={folder.id}
                  className={cn(
                    'flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-colors group',
                    selectedFolderId === folder.id
                      ? 'bg-primary text-primary-foreground font-medium shadow-sm'
                      : 'hover:bg-muted',
                  )}
                  onClick={() => setSelectedFolderId(folder.id)}
                >
                  <span className="truncate">{folder.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      'h-6 w-6 opacity-0 group-hover:opacity-100',
                      selectedFolderId === folder.id
                        ? 'text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground'
                        : 'text-muted-foreground hover:text-destructive',
                    )}
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteFolder(folder.id)
                      toast.success('Pasta excluída')
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Projects View */}
        <div className="md:col-span-8 lg:col-span-9 space-y-6">
          {!selectedFolderId ? (
            <div className="h-64 flex items-center justify-center border-2 border-dashed rounded-lg bg-card text-muted-foreground">
              Selecione uma pasta para ver os projetos.
            </div>
          ) : activeFolderProjects.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed rounded-lg bg-card gap-2">
              <FileText className="h-10 w-10 text-muted-foreground opacity-30" />
              <p className="text-muted-foreground font-medium">Nenhum projeto nesta pasta.</p>
              <Button variant="outline" onClick={() => navigate('/')}>
                Criar Novo Projeto
              </Button>
            </div>
          ) : (
            <div className="grid xl:grid-cols-2 gap-4">
              {activeFolderProjects.map((project) => {
                const projectVersions = versions
                  .filter((v) => v.projectId === project.id)
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                return (
                  <Card key={project.id} className="shadow-subtle overflow-hidden flex flex-col">
                    <CardHeader className="bg-muted/10 pb-4 border-b flex flex-row items-start justify-between space-y-0">
                      <div>
                        <CardTitle className="text-lg font-bold">{project.name}</CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">
                          {projectVersions.length} versão(ões) salva(s)
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => {
                          deleteProject(project.id)
                          toast.success('Projeto excluído')
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 flex flex-col">
                      {projectVersions.length === 0 ? (
                        <div className="p-6 text-sm text-center text-muted-foreground">
                          Nenhuma versão salva para este projeto.
                        </div>
                      ) : (
                        <div className="divide-y">
                          {projectVersions.map((v, i) => (
                            <div
                              key={v.id}
                              className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
                            >
                              <div>
                                <div className="font-medium text-sm flex items-center gap-2">
                                  {v.name}
                                  {i === 0 && (
                                    <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">
                                      Mais Recente
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-muted-foreground mt-0.5">
                                  {new Date(v.date).toLocaleString()}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                  onClick={() => deleteVersion(v.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => handleLoadVersion(v.id)}
                                >
                                  Abrir <ChevronRight className="ml-1 h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <Dialog open={isFolderDialogOpen} onOpenChange={setIsFolderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Nova Pasta</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <Label>Nome da Pasta</Label>
            <Input
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Ex: Clientes 2024"
              onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFolderDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateFolder} disabled={!newFolderName.trim()}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
