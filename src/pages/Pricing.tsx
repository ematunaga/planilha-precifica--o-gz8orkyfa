import { useState, useEffect, useMemo } from 'react'
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
  Eye,
  FileStack,
  Printer,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { calculateFinancials } from '@/lib/calculations'
import { ProjectVersion, ProposalRecord } from '@/types'
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
    proposalConditions,
    proposals,
    createVersion,
    loadVersion,
    deleteVersion,
    saveTemplate,
    saveProposalRecord,
    deleteProposalRecord,
  } = useMainStore()

  const { profile } = useAuth()

  const [isSaveOpen, setIsSaveOpen] = useState(false)
  const [newVersionName, setNewVersionName] = useState('')
  const [isTemplateOpen, setIsTemplateOpen] = useState(false)
  const [templateName, setTemplateName] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const [printMode, setPrintMode] = useState<'internal' | 'proposal' | 'reprint'>('internal')
  const [reprintData, setReprintData] = useState<ProposalRecord | null>(null)
  const [isProposalOpen, setIsProposalOpen] = useState(false)
  const [isProposalsHistoryOpen, setIsProposalsHistoryOpen] = useState(false)

  const [proposalMeta, setProposalMeta] = useState({ fileName: '', propNum: 773, verNum: 1 })
  const [clientData, setClientData] = useState({
    company: '',
    cnpj: '',
    address: '',
    contact: '',
    phone: '',
    email: '',
    proposalNumber: '',
    deliveryTime: '30 a 45 dias úteis',
    conditions: '',
  })

  useEffect(() => {
    const handleAfterPrint = () => {
      setPrintMode('internal')
      setReprintData(null)
      document.title = 'Planilha de Precificação' // reset title
    }
    window.addEventListener('afterprint', handleAfterPrint)
    return () => window.removeEventListener('afterprint', handleAfterPrint)
  }, [])

  const activeProject = projects.find((p) => p.id === activeProjectId)
  const activeFolder = folders.find((f) => f.id === activeProject?.folderId)
  const activeVersion = versions.find((v) => v.id === activeVersionId)

  const projectVersions = useMemo(() => {
    return versions
      .filter((v) => v.projectId === activeProjectId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [versions, activeProjectId])

  const projectProposals = useMemo(() => {
    return proposals
      .filter((p) => p.projectId === activeProjectId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [proposals, activeProjectId])

  const isViewer = profile?.role === 'Viewer' || profile?.role === 'Visualizador'

  const canDeleteVersion = (v: ProjectVersion) => {
    if (profile?.role === 'Admin') return true
    if (profile?.role === 'Editor') return v.createdBy === profile?.id
    return false
  }

  const canDeleteProposal = (p: ProposalRecord) => {
    if (profile?.role === 'Admin') return true
    if (profile?.role === 'Editor') return p.createdBy === profile?.id
    return false
  }

  // Pre-compute proposal file name and numbers when dialog opens
  useEffect(() => {
    if (isProposalOpen && activeProjectId) {
      let propNum = 773
      let verNum = 1

      if (projectProposals.length > 0) {
        propNum = projectProposals[0].proposalNumber
        verNum = Math.max(...projectProposals.map((p) => p.versionNumber)) + 1
      } else {
        if (proposals.length > 0) {
          propNum = Math.max(...proposals.map((p) => p.proposalNumber)) + 1
        }
      }

      setProposalMeta((prev) => {
        if (prev.propNum === propNum && prev.verNum === verNum) return prev
        return { ...prev, propNum, verNum }
      })
    }
  }, [isProposalOpen, activeProjectId, proposals, projectProposals])

  // Update dynamic file name when company name or numbers change
  useEffect(() => {
    const mf = products[0]?.manufacturer?.toUpperCase() || ''
    let X = 'O'
    if (mf.includes('HUAWEI')) X = 'H'
    else if (mf.includes('ACRONIS')) X = 'A'
    else if (mf.includes('AWS')) X = 'AWS'
    else if (mf.includes('FORTINET')) X = 'F'

    const d = new Date()
    const yy = d.getFullYear().toString().slice(-2)
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    const dateStr = `${yy}${mm}${dd}`

    const safeCompany = (clientData.company || 'Cliente').replace(/[^a-zA-Z0-9]/g, '')
    const fileName = `Promp${X}_${safeCompany}_${dateStr}_${proposalMeta.propNum}_V${String(proposalMeta.verNum).padStart(2, '0')}`

    setProposalMeta((prev) => {
      if (prev.fileName === fileName) return prev
      return { ...prev, fileName }
    })
    setClientData((prev) => {
      if (prev.proposalNumber === fileName) return prev
      return {
        ...prev,
        proposalNumber: fileName,
      }
    })
  }, [clientData.company, proposalMeta.propNum, proposalMeta.verNum, products])

  const handleOpenProposal = () => {
    if (!activeProjectId) {
      toast.error('Salve o projeto antes de gerar uma proposta.')
      return
    }

    if (!clientData.conditions) {
      const models = Array.from(new Set(products.map((p) => p.salesModel)))
      const distributors = Array.from(new Set(products.map((p) => p.distributor).filter(Boolean)))

      let conds = ''

      // Attempt to load specific distributor conditions
      if (distributors.length > 0) {
        const distCond = proposalConditions.find(
          (c) =>
            c.type === 'distributor' &&
            distributors.some((d) => d.toLowerCase().includes(c.name.toLowerCase())),
        )
        if (distCond) {
          conds += distCond.content + '\n\n'
        }
      }

      // Append Leap IT condition if channel
      if (models.includes('Channel')) {
        const leapCond = proposalConditions.find((c) => c.type === 'leapit')
        if (leapCond) {
          conds += leapCond.content
        } else {
          conds += `Condições adicionais Leap IT (Canal):\nFaturamento direto ao cliente pelo distribuidor.`
        }
      }

      // Fallback default
      if (!conds) {
        conds = `1. Validade da Proposta: 5 dias úteis a partir da emissão.\n2. Prazo de Entrega: ${clientData.deliveryTime}.\n3. Impostos: Inclusos conforme legislação vigente.\n4. Pagamento: A definir mediante análise de crédito.`
      }

      setClientData((prev) => ({ ...prev, conditions: conds.trim() }))
    }
    setIsProposalOpen(true)
  }

  const handleGeneratePDF = async () => {
    if (!clientData.company) {
      toast.error('Por favor, preencha o nome da empresa do cliente.')
      return
    }

    // Save Proposal Record
    if (activeProjectId) {
      await saveProposalRecord({
        projectId: activeProjectId,
        versionId: activeVersionId || undefined,
        fileName: proposalMeta.fileName,
        proposalNumber: proposalMeta.propNum,
        versionNumber: proposalMeta.verNum,
        clientName: clientData.company,
        content: {
          clientData,
          products,
          exchangeRate,
          displayCurrency,
          profile,
        },
      })
      toast.success('Proposta salva no histórico!')
    }

    setIsProposalOpen(false)
    setPrintMode('proposal')

    // Set document title for PDF file name
    document.title = proposalMeta.fileName

    setTimeout(() => {
      window.print()
    }, 500)
  }

  const handleReprint = (p: ProposalRecord) => {
    if (!p.content) {
      toast.error('O conteúdo desta proposta é de uma versão antiga e não pode ser reimpresso.')
      return
    }
    setReprintData(p)
    setPrintMode('reprint')
    document.title = p.fileName
    setIsProposalsHistoryOpen(false)
    setTimeout(() => {
      window.print()
    }, 500)
  }

  const handlePrintInternal = () => {
    setPrintMode('internal')
    document.title = `${activeProject?.name || 'Precificacao'} - Visao Interna`
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
          printMode === 'proposal' || printMode === 'reprint' ? 'print:hidden' : '',
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

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-primary/50 text-primary hover:bg-primary/10"
                >
                  <FileStack className="h-4 w-4 mr-2" /> Propostas
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={handleOpenProposal}>
                  <FileText className="h-4 w-4 mr-2" /> Nova Proposta
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsProposalsHistoryOpen(true)}>
                  <History className="h-4 w-4 mr-2" /> Histórico de Propostas
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

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
          printMode === 'proposal' || printMode === 'reprint' ? 'print:block' : 'print:hidden',
        )}
      >
        {printMode === 'reprint' && reprintData?.content ? (
          <ProposalDocument
            clientData={reprintData.content.clientData}
            products={reprintData.content.products}
            exchangeRate={reprintData.content.exchangeRate}
            displayCurrency={reprintData.content.displayCurrency}
            profile={reprintData.content.profile}
          />
        ) : (
          <ProposalDocument
            clientData={clientData}
            products={products}
            exchangeRate={exchangeRate}
            displayCurrency={displayCurrency}
            profile={profile}
          />
        )}
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

      <Dialog open={isProposalsHistoryOpen} onOpenChange={setIsProposalsHistoryOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
          <div className="p-6 border-b shrink-0 flex items-center justify-between bg-muted/30">
            <div>
              <DialogTitle className="text-xl">Histórico de Propostas</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Propostas geradas e salvas para este projeto.
              </p>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Arquivo</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projectProposals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground h-24">
                      Nenhuma proposta gerada para este projeto.
                    </TableCell>
                  </TableRow>
                ) : (
                  projectProposals.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono text-xs font-medium text-primary">
                        {p.fileName}
                      </TableCell>
                      <TableCell className="text-sm">{p.clientName}</TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {new Date(p.createdAt).toLocaleString('pt-BR')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleReprint(p)}>
                            <Printer className="h-4 w-4 mr-2" />
                            Reimprimir
                          </Button>
                          {canDeleteProposal(p) && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                deleteProposalRecord(p.id)
                                toast.success('Proposta excluída')
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <DialogFooter className="p-4 border-t bg-muted/30 shrink-0">
            <Button variant="outline" onClick={() => setIsProposalsHistoryOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isProposalOpen} onOpenChange={setIsProposalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
          <div className="p-6 border-b shrink-0 flex items-center justify-between bg-muted/30">
            <div>
              <DialogTitle className="text-xl">Gerar Proposta Comercial</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Arquivo:{' '}
                <span className="font-mono text-xs font-semibold text-primary">
                  {proposalMeta.fileName}.pdf
                </span>
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <Tabs defaultValue="edit" className="w-full h-full flex flex-col">
              <div className="px-6 pt-4 shrink-0">
                <TabsList className="w-full grid grid-cols-2">
                  <TabsTrigger value="edit">
                    <FileText className="h-4 w-4 mr-2" /> Dados & Condições
                  </TabsTrigger>
                  <TabsTrigger value="preview">
                    <Eye className="h-4 w-4 mr-2" /> Pré-visualização
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="edit" className="flex-1 p-6 m-0 border-none space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>
                      Empresa <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      value={clientData.company}
                      onChange={(e) => setClientData({ ...clientData, company: e.target.value })}
                      placeholder="Nome do cliente"
                      autoFocus
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
                    <Label>Número da Proposta (Ref)</Label>
                    <Input
                      value={clientData.proposalNumber}
                      disabled
                      className="bg-muted text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Prazo de Entrega</Label>
                    <Input
                      value={clientData.deliveryTime}
                      onChange={(e) =>
                        setClientData({ ...clientData, deliveryTime: e.target.value })
                      }
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
                    className="min-h-[160px] text-xs font-mono"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Estas condições foram pré-carregadas com base nos distribuidores e modelos de
                    venda selecionados. Você pode alterá-las livremente para esta proposta.
                  </p>
                </div>
              </TabsContent>

              <TabsContent
                value="preview"
                className="flex-1 m-0 p-6 bg-slate-100 overflow-hidden flex flex-col"
              >
                <p className="text-xs text-center text-slate-500 mb-4 shrink-0">
                  A visualização pode diferir levemente do PDF final gerado pelo navegador.
                </p>
                <div className="flex-1 overflow-y-auto border border-slate-300 shadow-xl rounded-sm bg-white mx-auto w-full max-w-[210mm] relative custom-scrollbar">
                  <div className="origin-top scale-[0.75] sm:scale-90 md:scale-100 w-[210mm] absolute left-1/2 -translate-x-1/2 top-0">
                    <ProposalDocument
                      clientData={clientData}
                      products={products}
                      exchangeRate={exchangeRate}
                      displayCurrency={displayCurrency}
                      profile={profile}
                      isPreview={true}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <DialogFooter className="p-6 border-t bg-muted/30 shrink-0">
            <Button variant="outline" onClick={() => setIsProposalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleGeneratePDF}>
              <FileText className="h-4 w-4 mr-2" />
              Gerar & Salvar PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
