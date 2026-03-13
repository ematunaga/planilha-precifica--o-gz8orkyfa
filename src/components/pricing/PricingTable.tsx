import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { PricingRow } from './PricingRow'
import { useMainStore } from '@/stores/main'
import { Search, Plus, RefreshCw } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { Product } from '@/types'
import { toast } from 'sonner'

export function PricingTable() {
  const {
    products,
    addProduct,
    exchangeRate,
    setExchangeRate,
    fetchExchangeRate,
    projects,
    activeProjectId,
    templates,
  } = useMainStore()
  const [search, setSearch] = useState('')

  const filteredProducts = products.filter(
    (p) =>
      p.pn.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()),
  )

  const handleUpdateExchange = async () => {
    await fetchExchangeRate()
    toast.success('Cotação atualizada via API!')
  }

  const handleAddProduct = () => {
    const activeProject = projects.find((p) => p.id === activeProjectId)
    const template = activeProject?.templateId
      ? templates.find((t) => t.id === activeProject.templateId)
      : null

    const newProduct: Product = {
      id: Date.now().toString(),
      pn: 'NOVO-ITEM',
      description: 'Novo item ou serviço',
      type: 'HW',
      currency: 'BRL',
      qty: 1,
      unitCost: 100,
      st: 0,
      salesModel: 'Direct',
      taxRates: template ? { ...template.taxRates } : { icms: 0, ipi: 0, pisCofins: 9.25, iss: 0 },
      encargoRates: template ? { ...template.encargoRates } : { nf: 2, admin: 5, comissao: 3 },
      salesFactor: 1.5,
    }
    addProduct(newProduct)
  }

  return (
    <Card className="overflow-hidden border shadow-sm flex flex-col">
      <div className="p-4 border-b bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-4">
        <h2 className="text-lg font-semibold tracking-tight">Planilha de Custos</h2>
        <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
          <div className="flex items-center gap-2">
            <Label className="whitespace-nowrap text-xs text-muted-foreground">Cot. USD:</Label>
            <div className="relative flex items-center">
              <Input
                type="number"
                step="0.01"
                value={exchangeRate}
                onChange={(e) => setExchangeRate(Number(e.target.value))}
                className="h-9 w-24 text-right bg-background pr-8"
                title="Cotação USD"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 h-9 w-8 text-muted-foreground hover:text-primary"
                onClick={handleUpdateExchange}
                title="Atualizar via API"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar Part Number..."
              className="h-9 pl-9 bg-background"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button onClick={handleAddProduct} size="sm" className="h-9 shrink-0">
            <Plus className="h-4 w-4 mr-1" /> Adicionar
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-[200px] lg:w-[250px]">Produto</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Qtd</TableHead>
              <TableHead className="text-right">Custo</TableHead>
              <TableHead className="text-right hidden md:table-cell">Impostos</TableHead>
              <TableHead className="text-right hidden lg:table-cell">Encargos</TableHead>
              <TableHead className="text-right w-[120px]">Fator / Preço</TableHead>
              <TableHead className="text-right w-[120px]">Resultado Líq.</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                  Nenhum produto encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => <PricingRow key={product.id} product={product} />)
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}
