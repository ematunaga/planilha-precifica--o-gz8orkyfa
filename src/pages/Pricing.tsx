import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Save,
  FileSpreadsheet,
  FileText,
  History,
  Trash2,
  ChevronRight,
  AlertCircle,
  BookmarkPlus,
  Loader2,
} from 'lucide-react'
import { SummaryCards } from '@/components/pricing/SummaryCards'
import { PricingTable } from '@/components/pricing/PricingTable'
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
import { useMainStore } from '@/stores/main'
import { useAuth } from '@/hooks/use-auth'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { toast } from 'sonner'
import { calculateFinancials } from '@/lib/calculations'
import { ProjectVersion } from '@/types'
import { savePricingItems } from '@/services/pricing_items'

export default function Pricing() {
  const navigate = useNavigate()
  const {
    products,
    exchangeRate,
    displayCurrency,
    setDisplayCurrency,
    activeProjectId,
    activeVersionId,
    projects,
    folders,
    versions,
    createVersion,
    loadVersion,
    deleteVersion,
    saveTemplate,
  } = useMainStore()

  const { profile } = useAuth()

  const [isSaveOpen, setIsSaveOpen] = useState(false)
  const [newVersionName, setNewVersionName] = useState('')
  const [isTemplateOpen, setIsTemplateOpen] = useState(false)
  const [templateName, setTemplateName] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const activeProject = projects.find((p) => p.id === activeProjectId)
  const activeFolder = folders.find((f) => f.id === activeProject?.folderId)
  const activeVersion = versions.find((v) => v.id === activeVersionId)
  const projectVersions = versions
    .filter((v) => v.projectId === activeProjectId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const isViewer = profile?.role === 'Viewer' || profile?.role === 'Visualizador'

  const canDeleteVersion = (v: ProjectVersion) => {
    if (profile?.role === 'Admin') return true
    if (profile?.role === 'Editor') return v.createdBy === profile?.id
    return false
  }

  if (!activeProjectId || !activeProject) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <AlertCircle className="h-16 w-16 text-muted-foreground opacity-20" />
        <h2 className="text-xl font-semibold">Nenhum projeto ativo</h2>
        <p className="text-muted-foreground text-center max-w-sm">
          Para acessar a planilha, crie um novo projeto ou abra um existente.
        </p>
        <Button onClick={() => navigate('/projetos')}>Ir para Projetos</Button>
      </div>
    )
  }

  const handleSave = async () => {
    if (!activeProjectId) return
    setIsSaving(true)
    const name = newVersionName.trim() || `Versão ${projectVersions.length + 1}`
    
    try {
      const vid = createVersion(activeProjectId, name)
      if (products.length > 0) {
        await savePricingItems(vid, activeProjectId, products)
      }
      setIsSaveOpen(false)
      setNewVersionName('')
      toast.success('Versão salva com sucesso!')
    } catch (e: any) {
      toast.error(e.message || 'Erro ao salvar versão no banco de dados.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveTemplate = () => {
    if (!templateName.trim()) return
    const sourceRates =
      products.length > 0
        ? { taxRates: products[0].taxRates, encargoRates: products[0].encargoRates }
        : {
            taxRates: { icms: 0, ipi: 0, pis: 1.65, cofins: 7.6, iss: 0 },
            encargoRates: { nf: 2, admin: 5, comissao: 3 },
          }

    saveTemplate(templateName.trim(), sourceRates.taxRates, sourceRates.encargoRates)
    setIsTemplateOpen(false)
    setTemplateName('')
    toast.success('Template salvo com sucesso!')
  }

  const handleExportExcel = () => {
    const headers = [
      'PN',
      'Descrição',
      'Tipo',
      'Qtd',
      'Moeda',
      'Custo Unit',
      'Custo Total BRL',
      'Fator',
      'Preço Venda BRL',
      'Total Venda BRL',
      'Impostos BRL',
      'Encargos BRL',
      'Margem BRL',
      'Margem %',
    ]
    const rows = products.map((p) => {
      const f = calculateFinancials(p, exchangeRate)
      return [
        `"${p.pn}"`,
        `"${p.description}"`,
        p.type,
        p.qty,
        p.currency,
        p.unitCost.toFixed(2),
        f.totalPurchaseCost.toFixed(2),
        p.salesFactor.toFixed(4),
        f.unitSalePrice.toFixed(2),
        f.totalSalePrice.toFixed(2),
        f.totalTaxesValue.toFixed(2),
        f.totalEncargosValue.toFixed(2),
        f.netMargin.toFixed(2),
        f.netMarginPercent.toFixed(2) + '%',
      ].join(',')
    })
    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${activeProject.name}_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    toast.success('Arquivo Excel gerado com sucesso!')
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <span className="truncate max-w-[150px]" title={activeFolder?.name}>
              {activeFolder?.name}
            </span>
            <ChevronRight className="h-3 w-3 shrink-0" />
            <span
              className="font-medium text-foreground truncate max-w-[200px]"
              title={activeProject.name}
            >
              {activeProject.name}
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            Precificação
            <Badge
              variant="secondary"
              className="text-xs font-normal print:hidden bg-primary/10 text-primary border-primary/20"
            >
              {activeVersion?.name || 'Rascunho Não Salvo'}
            </Badge>
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2 no-print">
          <ToggleGroup
            type="single"
            value={displayCurrency}
            onValueChange={(val) => val && setDisplayCurrency(val as 'BRL' | 'USD')}
            className="bg-background border rounded-md h-9"
          >
            <ToggleGroupItem
              value="BRL"
              aria-label="BRL"
              className="h-full px-3 text-xs font-medium"
            >
              BRL
            </ToggleGroupItem>
            <ToggleGroupItem
              value="USD"
              aria-label="USD"
              className="h-full px-3 text-xs font-medium"
            >
              USD
            </ToggleGroupItem>
          </ToggleGroup>

          {!isViewer && (
            <>
              <Button variant="outline" size="sm" onClick={() => setIsTemplateOpen(true)}>
                <BookmarkPlus className="h-4 w-4 mr-2" /> Template
              </Button>
              <Button size="sm" onClick={() => setIsSaveOpen(true)} className="shadow-sm">
                <Save className="h-4 w-4 mr-2" /> Salvar Versão
              </Button>
            </>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <History className="h-4 w-4 mr-2" /> Histórico
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>Versões deste Projeto</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {projectVersions.length === 0 ? (
                <div className="p-3 text-sm text-muted-foreground text-center">
                  Nenhuma versão salva
                </div>
              ) : (
                projectVersions.map((v) => (
                  <DropdownMenuItem
                    key={v.id}
                    className="flex justify-between items-center group py-2"
                  >
                    <div
                      className="flex flex-col cursor-pointer flex-1"
                      onClick={() => {
                        loadVersion(v.id)
                        toast.success('Versão carregada!')
                      }}
                    >
                      <span className="font-medium text-sm">{v.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(v.date).toLocaleString()}
                      </span>
                    </div>
                    {canDeleteVersion(v) && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteVersion(v.id)
                          toast.success('Versão apagada')
                        }}
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    )}
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="sm" onClick={handleExportExcel}>
            <FileSpreadsheet className="h-4 w-4 mr-2 text-emerald-600" /> Excel
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <FileText className="h-4 w-4 mr-2 text-rose-600" /> PDF
          </Button>
        </div>
      </div>

      <SummaryCards />
      <div className="print-area">
        <PricingTable />
      </div>

      <Dialog open={isSaveOpen} onOpenChange={setIsSaveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Salvar Nova Versão</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome da Versão</Label>
              <Input
                value={newVersionName}
                onChange={(e) => setNewVersionName(e.target.value)}
                placeholder={`Ex: Versão ${projectVersions.length + 1}`}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                autoFocus
                disabled={isSaving}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSaveOpen(false)} disabled={isSaving}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isTemplateOpen} onOpenChange={setIsTemplateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Salvar como Template</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Salva as taxas e encargos do primeiro item para reuso em novos projetos.
            </p>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome do Template</Label>
              <Input
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Ex: Margem Serviços Enterprise"
                onKeyDown={(e) => e.key === 'Enter' && handleSaveTemplate()}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTemplateOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveTemplate} disabled={!templateName.trim()}>
              Salvar Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
