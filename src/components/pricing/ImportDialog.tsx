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
import { useAuth } from '@/hooks/use-auth'
import { Product, ProductType } from '@/types'
import { UploadCloud, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'
import { parseFile, parseNumber } from '@/lib/file-parser'

const MAPPABLE_FIELDS = [
  { id: 'pn', label: 'Part Number' },
  { id: 'description', label: 'Descrição' },
  { id: 'type', label: 'Tipo' },
  { id: 'currency', label: 'Moeda' },
  { id: 'qty', label: 'Quantidade' },
  { id: 'unitCost', label: 'Custo Unitário' },
  { id: 'pis', label: 'PIS (%)' },
  { id: 'cofins', label: 'COFINS (%)' },
  { id: 'difal', label: 'DIFAL (%)' },
]

export function ImportDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { addProducts } = useMainStore()
  const { profile } = useAuth()
  const [step, setStep] = useState<'upload' | 'map' | 'preview'>('upload')
  const [headers, setHeaders] = useState<string[]>([])
  const [rows, setRows] = useState<string[][]>([])
  const [mapping, setMapping] = useState<Record<string, number>>({})
  const [isUploading, setIsUploading] = useState(false)

  const reset = () => {
    setStep('upload')
    setHeaders([])
    setRows([])
    setMapping({})
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const data = await parseFile(file)
      setHeaders(data.headers)
      setRows(data.rows)
      setStep('map')
    } catch (err: any) {
      toast.error(err.message || 'Erro ao processar o arquivo. Verifique o formato.')
    } finally {
      setIsUploading(false)
      e.target.value = ''
    }
  }

  const handleComplete = async () => {
    const newProducts: Product[] = rows.map((row) => {
      const getVal = (key: string) => (mapping[key] !== undefined ? row[mapping[key]] : '')
      const typeStr = getVal('type').toUpperCase()
      const type: ProductType =
        typeStr === 'SW' ? 'SW' : typeStr.includes('SERV') ? 'Serviço' : 'HW'
      const currency = getVal('currency').toUpperCase().includes('USD') ? 'USD' : 'BRL'
      return {
        id: Date.now().toString() + Math.random().toString(36).substring(7),
        pn: getVal('pn') || 'ITEM-' + Math.floor(Math.random() * 10000),
        description: getVal('description') || 'Item importado',
        type,
        currency,
        qty: parseNumber(getVal('qty'), 1),
        unitCost: parseNumber(getVal('unitCost'), 0),
        difal: parseNumber(getVal('difal'), 0),
        salesModel: 'Direct',
        taxRates: {
          icms: 0,
          ipi: 0,
          iss: 0,
          pis: parseNumber(getVal('pis'), 1.65),
          cofins: parseNumber(getVal('cofins'), 7.6),
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
        created_by: profile?.id,
      }))
      await supabase.from('pricing_items').insert(inserts)
    } catch (err) {
      console.error('Falha ao persistir no DB', err)
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
          <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg bg-muted/20 relative">
            {isUploading && (
              <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center z-10 rounded-lg">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                <p className="text-sm font-medium">Extraindo dados do arquivo...</p>
              </div>
            )}
            <UploadCloud className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm font-medium mb-2">
              Selecione um arquivo CSV, TXT, Excel (.xlsx, .xls) ou PDF
            </p>
            <Input
              type="file"
              accept=".csv,.xlsx,.xls,.pdf,.txt"
              onChange={handleFileUpload}
              className="max-w-[250px]"
              disabled={isUploading}
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
              <div>Colunas do Arquivo ({headers.length} encontradas)</div>
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
                          {h || `Coluna ${i + 1}`}
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
              Revise os {rows.length} itens encontrados antes de confirmar a importação.
            </p>
            <div className="border rounded-md overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>PN</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Qtd</TableHead>
                    <TableHead>Custo</TableHead>
                    <TableHead>DIFAL (%)</TableHead>
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
                        {mapping['qty'] !== undefined ? row[mapping['qty']] : '-'}
                      </TableCell>
                      <TableCell>
                        {mapping['unitCost'] !== undefined ? row[mapping['unitCost']] : '-'}
                      </TableCell>
                      <TableCell>
                        {mapping['difal'] !== undefined ? row[mapping['difal']] : '-'}
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
