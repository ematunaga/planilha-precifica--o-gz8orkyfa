import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/lib/formatters'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { History, Search, Box, LineChart } from 'lucide-react'
import { fetchProducts, fetchProductHistory } from '@/services/products'

export default function Produtos() {
  const navigate = useNavigate()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const [historyOpen, setHistoryOpen] = useState(false)
  const [history, setHistory] = useState<any[]>([])
  const [selectedProduct, setSelectedProduct] = useState<any>(null)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    setLoading(true)
    try {
      const data = await fetchProducts()
      setProducts(data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleViewHistory = async (product: any) => {
    setSelectedProduct(product)
    setHistoryOpen(true)
    try {
      const data = await fetchProductHistory(product.id)
      setHistory(data || [])
    } catch (e) {
      console.error(e)
    }
  }

  const filtered = products.filter(
    (p) =>
      p.part_number?.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase()) ||
      p.manufacturer?.toLowerCase().includes(search.toLowerCase()) ||
      p.distributor?.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full h-full">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Módulo de Produtos</h2>
        <p className="text-muted-foreground">Catálogo mestre e histórico de preços.</p>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por PN, descrição, fabricante..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => navigate('/dashboard-precos')}
          className="shadow-sm w-full sm:w-auto"
        >
          <LineChart className="w-4 h-4 mr-2" /> Dashboard de Preços
        </Button>
      </div>

      <div className="border rounded-md bg-card shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="overflow-auto flex-1">
          <Table>
            <TableHeader className="bg-muted/50 sticky top-0 z-10 shadow-sm">
              <TableRow>
                <TableHead>Part Number</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Fabricante</TableHead>
                <TableHead>Distribuidor</TableHead>
                <TableHead className="text-right">Último Preço</TableHead>
                <TableHead>Atualizado em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    Carregando produtos...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-48 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Box className="h-8 w-8 opacity-20" />
                      <p>Nenhum produto encontrado.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((p) => (
                  <TableRow key={p.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{p.part_number}</TableCell>
                    <TableCell className="max-w-[200px] truncate" title={p.description}>
                      {p.description || '-'}
                    </TableCell>
                    <TableCell>{p.manufacturer || '-'}</TableCell>
                    <TableCell>{p.distributor || '-'}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(p.current_unit_cost, p.currency)}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(p.updated_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleViewHistory(p)}>
                        <History className="h-4 w-4 mr-2" /> Histórico
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Histórico de Preço: {selectedProduct?.part_number}</DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto mt-4 border rounded-md">
            <Table>
              <TableHeader className="bg-muted/50 sticky top-0">
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Custo Unitário</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center py-4 text-muted-foreground">
                      Nenhum histórico encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  history.map((h) => (
                    <TableRow key={h.id}>
                      <TableCell>{new Date(h.created_at).toLocaleString()}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(h.unit_cost, h.currency)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
