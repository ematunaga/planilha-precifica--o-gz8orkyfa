import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useMainStore } from '@/stores/main'
import { Product, ProductType } from '@/types'
import { UploadCloud, ArrowRight, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'

const MAPPABLE_FIELDS = [
  { id: 'pn', label: 'Part Number' },
  { id: 'description', label: 'Descrição' },
  { id: 'type', label: 'Tipo (HW/SW/Serviço)' },
  { id: 'currency', label: 'Moeda (BRL/USD)' },
  { id: 'qty', label: 'Quantidade' },
  { id: 'unitCost', label: 'Custo unitário' },
  { id: 'impostos', label: 'Impostos (%)' },
]

export function ImportDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { addProducts } = useMainStore()
  const [step, setStep] = useState<'upload' | 'map' | 'preview'>('upload')
  const [headers, setHeaders] = useState<string[]>([])
  const [rows, setRows] = useState<string[][]>([])
  const [mapping, setMapping] = useState<Record<string, number>>({})

  const reset = () => {
    setStep('upload')
    setHeaders([])
    setRows([])
    setMapping({})
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.name.endsWith('.csv')) {
      const reader = new FileReader()
      reader.onload = (evt) => {
        const text = evt.target?.result as string
        const lines = text
          .split('\n')
          .map((l) => l.trim())
          .filter((l) => l)
        if (lines.length < 2) {
          toast.error('Arquivo CSV vazio ou inválido.')
          return
        }
        const parsedHeaders = lines[0].split(',').map((h) => h.trim().replace(/"/g, ''))
        const parsedRows = lines
          .slice(1)
          .map((l) => l.split(',').map((c) => c.trim().replace(/"/g, '')))
        setHeaders(parsedHeaders)
        setRows(parsedRows)
        setStep('map')
      }
      reader.readAsText(file)
    } else {
      // Simulate extraction for Excel/PDF
      toast.info('Simulando extração de dados para demonstração...')
      setTimeout(() => {
        setHeaders(['CÓDIGO', 'PRODUTO_DESC', 'CATEGORIA', 'VALOR_COMPRA', 'MOEDA', 'QTD'])
        setRows([
          ['PRD-001', 'Servidor Enterprise', 'HW', '5000.00', 'BRL', '2'],
          ['LIC-002', 'Licença Anual', 'SW', '1200.00', 'USD', '10'],
        ])
        setStep('map')
      }, 1500)
    }
  }

  const handleComplete = async () => {
    const newProducts: Product[] = rows.map((row) => {
      const getVal = (key: string) => (mapping[key] !== undefined ? row[mapping[key]] : '')

      const typeStr = getVal('type').toUpperCase()
      const type: ProductType =
        typeStr === 'SW' ? 'SW' : typeStr.includes('SERV') ? 'Serviço' : 'HW'
      const currency = getVal('currency').toUpperCase() === 'USD' ? 'USD' : 'BRL'
      const impostosPerc = parseFloat(getVal('impostos')) || 0

      return {
        id: Date.now().toString() + Math.random().toString(36).substring(7),
        pn: getVal('pn') || 'DESC-' + Math.floor(Math.random() * 1000),
        description: getVal('description') || 'Item importado',
        type,
        currency,
        qty: parseFloat(getVal('qty')) || 1,
        unitCost: parseFloat(getVal('unitCost')) || 0,
        difal: 0,
        salesModel: 'Direct',
        taxRates: {
          icms: 0,
          ipi: 0,
          pis: impostosPerc > 0 ? impostosPerc * 0.2 : 1.65,
          cofins: impostosPerc > 0 ? impostosPerc * 0.8 : 7.6,
          iss: 0,
        },
        encargoRates: { nf: 2, admin: 5, comissao: 3 },
        salesFactor: 1.5,
      }
    })

    addProducts(newProducts)

    try {
      const inserts = newProducts.map((p) => ({
        part_number: p.pn,
        description: p.description,
        type: p.type,
        currency: p.currency,
        quantity: p.qty,
        unit_cost: p.unitCost,
        pis: p.taxRates.pis,
        cofins: p.taxRates.cofins,
        difal: p.difal,
      }))
      await supabase.from('pricing_items').insert(inserts)
    } catch (err) {
      console.error('Failed to persist to DB', err)
    }

    toast.success(`${newProducts.length} itens importados com sucesso!`)
    onOpenChange(false)
    reset()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        onOpenChange(val)
        if (!val) reset()
      }}
    >
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Importar Dados do Distribuidor</DialogTitle>
        </DialogHeader>

        {step === 'upload' && (
          <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg bg-muted/20">
            <UploadCloud className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm font-medium mb-2">Selecione um arquivo CSV, Excel ou PDF</p>
            <Input
              type="file"
              accept=".csv,.xlsx,.xls,.pdf"
              onChange={handleFileUpload}
              className="max-w-[250px]"
            />
          </div>
        )}

        {step === 'map' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Mapeie as colunas do arquivo para os campos do sistema.
            </p>
            <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-md font-medium text-sm">
              <div>Campos do Sistema</div>
              <div>Colunas do Arquivo</div>
            </div>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {MAPPABLE_FIELDS.map((field) => (
                <div key={field.id} className="grid grid-cols-2 gap-4 items-center">
                  <Label>{field.label}</Label>
                  <Select
                    value={mapping[field.id]?.toString()}
                    onValueChange={(val) =>
                      setMapping((prev) => ({ ...prev, [field.id]: parseInt(val) }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma coluna..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="-1" className="text-muted-foreground">
                        Não mapear
                      </SelectItem>
                      {headers.map((h, i) => (
                        <SelectItem key={i} value={i.toString()}>
                          {h}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
            <DialogFooter className="mt-6">
              <Button onClick={() => setStep('preview')}>
                Pré-visualizar <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === 'preview' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Revise os {rows.length} itens antes de confirmar a importação.
            </p>
            <div className="border rounded-md overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>PN</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Qtd</TableHead>
                    <TableHead>Custo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.slice(0, 5).map((row, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        {mapping['pn'] !== undefined ? row[mapping['pn']] : '-'}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {mapping['description'] !== undefined ? row[mapping['description']] : '-'}
                      </TableCell>
                      <TableCell>
                        {mapping['type'] !== undefined ? row[mapping['type']] : '-'}
                      </TableCell>
                      <TableCell>
                        {mapping['qty'] !== undefined ? row[mapping['qty']] : '-'}
                      </TableCell>
                      <TableCell>
                        {mapping['unitCost'] !== undefined ? row[mapping['unitCost']] : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {rows.length > 5 && (
              <p className="text-xs text-muted-foreground text-center">
                Mostrando 5 de {rows.length} linhas
              </p>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setStep('map')}>
                Voltar
              </Button>
              <Button onClick={handleComplete}>
                Confirmar Importação <CheckCircle2 className="h-4 w-4 ml-2" />
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
