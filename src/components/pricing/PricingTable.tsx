import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { PricingRow } from './PricingRow'
import { useMainStore } from '@/stores/main'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useState } from 'react'

export function PricingTable() {
  const { products } = useMainStore()
  const [search, setSearch] = useState('')

  const filteredProducts = products.filter(
    (p) =>
      p.pn.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <Card className="overflow-hidden border shadow-sm flex flex-col">
      <div className="p-4 border-b bg-muted/20 flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight">Planilha de Custos</h2>
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar Part Number..."
            className="h-9 pl-9 bg-background"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-[250px]">Produto</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Qtd</TableHead>
              <TableHead className="text-right">Custo</TableHead>
              <TableHead className="text-right hidden md:table-cell">Impostos</TableHead>
              <TableHead className="text-right hidden lg:table-cell">Encargos</TableHead>
              <TableHead className="text-right w-[120px]">Fator / Preço</TableHead>
              <TableHead className="text-right w-[120px]">Resultado Líq.</TableHead>
              <TableHead className="w-[40px]"></TableHead>
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
