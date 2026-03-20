import { useState, useEffect } from 'react'
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
import { ProposalDocument } from '@/components/pricing/ProposalDocument'
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
import { Textarea } from '@/components/ui/textarea'
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
import { cn } from '@/lib/utils'

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

  const [printMode, setPrintMode] = useState<'internal' | 'proposal'>('internal')
  const [isProposalOpen, setIsProposalOpen] = useState(false)
  const [clientData, setClientData] = useState({
    company: '',
    cnpj: '',
    address: '',
    contact: '',
    phone: '',
    email: '',
    proposalNumber: `PROP-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
    deliveryTime: '30 a 45 dias úteis',
    conditions: '',
  })

  useEffect(() => {
    const handleAfterPrint = () => setPrintMode('internal')
    window.addEventListener('afterprint', handleAfterPrint)
    return () => window.removeEventListener('afterprint', handleAfterPrint)
  }, [])

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

  const handleOpenProposal = () => {
    if (!clientData.conditions) {
      const models = Array.from(new Set(products.map((p) => p.salesModel)))
      const distributors = Array.from(new Set(products.map((p) => p.distributor).filter(Boolean)))

      let conds = `1. Validade da Proposta: 5 dias úteis a partir da emissão.\n`
      conds += `2. Prazo de Entrega: ${clientData.deliveryTime}.\n`
      conds += `3. Impostos: Inclusos conforme legislação vigente.\n`

      if (models.includes('Channel')) {
        const distText = distributors.length > 0 ? ` (${distributors.join(', ')})` : ''
        conds += `4. Faturamento: Direto ao cliente pelo distribuidor${distText}.\n`
      } else {
        conds += `4. Faturamento: Faturamento direto pela Leap IT.\n`
      }
      conds += `5. Pagamento: A definir mediante análise de crédito.`

      setClientData((prev) => ({ ...prev, conditions: conds }))
    }
    setIsProposalOpen(true)
  }

  const handleGeneratePDF = () => {
    if (!clientData.company) {
      toast.error('Por favor, preencha o nome da empresa do cliente.')
      return
    }
    setIsProposalOpen(false)
    setPrintMode('proposal')
    setTimeout(() => {
      window.print()
    }, 300)
  }

  const handlePrintInternal = () => {
    setPrintMode('internal')
    setTimeout(() => window.print(), 100)
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
    <>
      <div
        className={cn(
          'flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500',
          printMode === 'proposal' ? 'print:hidden' : '',
        )}
      >
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

            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenProposal}
              className="border-primary/50 text-primary hover:bg-primary/10"
            >
              <FileText className="h-4 w-4 mr-2" /> Gerar Proposta
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportExcel}>
              <FileSpreadsheet className="h-4 w-4 mr-2 text-emerald-600" /> Excel
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrintInternal}>
              <FileText className="h-4 w-4 mr-2 text-rose-600" /> PDF Interno
            </Button>
          </div>
        </div>

        <SummaryCards />
        <div className="print-area">
          <PricingTable />
        </div>
      </div>

      <div
        className={cn(
          'hidden w-full bg-white text-black min-h-screen',
          printMode === 'proposal' ? 'print:block' : 'print:hidden',
        )}
      >
        <ProposalDocument
          clientData={clientData}
          products={products}
          exchangeRate={exchangeRate}
          displayCurrency={displayCurrency}
          profile={profile}
        />
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

      <Dialog open={isProposalOpen} onOpenChange={setIsProposalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gerar Proposta Comercial</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  Empresa <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={clientData.company}
                  onChange={(e) => setClientData({ ...clientData, company: e.target.value })}
                  placeholder="Nome do cliente"
                />
              </div>
              <div className="space-y-2">
                <Label>CNPJ</Label>
                <Input
                  value={clientData.cnpj}
                  onChange={(e) => setClientData({ ...clientData, cnpj: e.target.value })}
                  placeholder="00.000.000/0000-00"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Endereço</Label>
                <Input
                  value={clientData.address}
                  onChange={(e) => setClientData({ ...clientData, address: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Contato (Nome)</Label>
                <Input
                  value={clientData.contact}
                  onChange={(e) => setClientData({ ...clientData, contact: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input
                  value={clientData.phone}
                  onChange={(e) => setClientData({ ...clientData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={clientData.email}
                  onChange={(e) => setClientData({ ...clientData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t">
              <div className="space-y-2">
                <Label>Número da Proposta</Label>
                <Input
                  value={clientData.proposalNumber}
                  onChange={(e) => setClientData({ ...clientData, proposalNumber: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Prazo de Entrega</Label>
                <Input
                  value={clientData.deliveryTime}
                  onChange={(e) => setClientData({ ...clientData, deliveryTime: e.target.value })}
                  onBlur={(e) => {
                    if (clientData.conditions.includes('Prazo de Entrega:')) {
                      setClientData((prev) => ({
                        ...prev,
                        conditions: prev.conditions.replace(
                          /Prazo de Entrega:.*?\./,
                          `Prazo de Entrega: ${e.target.value}.`,
                        ),
                      }))
                    }
                  }}
                />
              </div>
            </div>

            <div className="space-y-2 mt-4 pt-4 border-t">
              <Label>Condições Gerais de Fornecimento</Label>
              <Textarea
                value={clientData.conditions}
                onChange={(e) => setClientData({ ...clientData, conditions: e.target.value })}
                className="min-h-[120px]"
              />
              <p className="text-[10px] text-muted-foreground">
                Revise os termos gerados automaticamente com base no modelo de venda dos produtos
                selecionados.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProposalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleGeneratePDF}>
              <FileText className="h-4 w-4 mr-2" />
              Gerar PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
