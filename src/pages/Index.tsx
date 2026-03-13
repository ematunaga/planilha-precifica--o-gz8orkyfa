import { useState } from 'react'
import { Save, FileSpreadsheet, FileText, History, Trash2, Check } from 'lucide-react'
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

const Index = () => {
  const {
    products,
    exchangeRate,
    displayCurrency,
    setDisplayCurrency,
    versions,
    saveVersion,
    loadVersion,
    deleteVersion,
  } = useMainStore()
  const [isSaveOpen, setIsSaveOpen] = useState(false)
  const [newVersionName, setNewVersionName] = useState('')

  const handleSave = () => {
    const name = newVersionName.trim() || `Versão ${versions.length + 1}`
    saveVersion(name)
    setIsSaveOpen(false)
    setNewVersionName('')
    toast.success('Versão salva com sucesso!')
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
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Precificacao_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    toast.success('Arquivo Excel gerado com sucesso!')
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            Dashboard de Precificação
            <Badge variant="secondary" className="text-xs font-normal print:hidden">
              Versão Atual
            </Badge>
          </h2>
          <p className="text-muted-foreground print:hidden">
            Visão geral da precificação, margens e simulações do projeto.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 no-print">
          <ToggleGroup
            type="single"
            value={displayCurrency}
            onValueChange={(val) => {
              if (val) setDisplayCurrency(val as 'BRL' | 'USD')
            }}
            className="bg-background border rounded-md h-9"
          >
            <ToggleGroupItem value="BRL" aria-label="BRL" className="h-full px-3 text-xs">
              BRL
            </ToggleGroupItem>
            <ToggleGroupItem value="USD" aria-label="USD" className="h-full px-3 text-xs">
              USD
            </ToggleGroupItem>
          </ToggleGroup>

          <Button variant="outline" size="sm" onClick={() => setIsSaveOpen(true)}>
            <Save className="h-4 w-4 mr-2" /> Salvar Versão
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <History className="h-4 w-4 mr-2" /> Histórico
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Versões Salvas</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {versions.length === 0 ? (
                <div className="p-2 text-sm text-muted-foreground text-center">
                  Nenhuma versão salva
                </div>
              ) : (
                versions.map((v) => (
                  <DropdownMenuItem key={v.id} className="flex justify-between items-center group">
                    <div
                      className="flex flex-col cursor-pointer flex-1"
                      onClick={() => {
                        loadVersion(v.id)
                        toast.success('Versão carregada!')
                      }}
                    >
                      <span className="font-medium text-sm">{v.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(v.date).toLocaleDateString()}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteVersion(v.id)
                      }}
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="sm" onClick={handleExportExcel}>
            <FileSpreadsheet className="h-4 w-4 mr-2" /> Excel
          </Button>

          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <FileText className="h-4 w-4 mr-2" /> PDF
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
                placeholder={`Ex: Versão ${versions.length + 1}`}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSaveOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Index
