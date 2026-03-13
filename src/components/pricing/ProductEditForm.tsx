import { Product, FinancialResult } from '@/types'
import { useMainStore } from '@/stores/main'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatCurrency } from '@/lib/formatters'
import { Separator } from '@/components/ui/separator'

export function ProductEditForm({
  product,
  financials,
}: {
  product: Product
  financials: FinancialResult
}) {
  const { updateProduct } = useMainStore()

  const handleUpdate = (updates: Partial<Product>) => {
    updateProduct(product.id, updates)
  }

  const renderField = (
    label: string,
    value: string | number,
    onChange: (val: string) => void,
    type: 'text' | 'number' = 'text',
    subValue?: string,
    className?: string,
  ) => (
    <div className={`space-y-1 ${className || ''}`}>
      <Label>{label}</Label>
      <Input
        type={type}
        step={type === 'number' ? '0.01' : undefined}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {subValue && <div className="text-[10px] text-muted-foreground">{subValue}</div>}
    </div>
  )

  return (
    <div className="space-y-6 text-sm">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {renderField(
          'Part Number',
          product.pn,
          (v) => handleUpdate({ pn: v }),
          'text',
          undefined,
          'lg:col-span-2',
        )}
        {renderField(
          'Descrição',
          product.description,
          (v) => handleUpdate({ description: v }),
          'text',
          undefined,
          'lg:col-span-3',
        )}
        <div className="space-y-1">
          <Label>Tipo</Label>
          <Select value={product.type} onValueChange={(v: any) => handleUpdate({ type: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="HW">HW</SelectItem>
              <SelectItem value="SW">SW</SelectItem>
              <SelectItem value="Serviço">Serviço</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Moeda</Label>
          <Select
            value={product.currency}
            onValueChange={(v: any) => handleUpdate({ currency: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BRL">BRL</SelectItem>
              <SelectItem value="USD">USD</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {renderField('Quantidade', product.qty, (v) => handleUpdate({ qty: Number(v) }), 'number')}
        {renderField(
          'Custo Unitário',
          product.unitCost,
          (v) => handleUpdate({ unitCost: Number(v) }),
          'number',
        )}
        {renderField(
          'ICMS (%)',
          product.taxRates.icms,
          (v) => handleUpdate({ taxRates: { ...product.taxRates, icms: Number(v) } }),
          'number',
          formatCurrency(financials.taxValues.icms),
        )}
        {renderField(
          'IPI (%)',
          product.taxRates.ipi,
          (v) => handleUpdate({ taxRates: { ...product.taxRates, ipi: Number(v) } }),
          'number',
          formatCurrency(financials.taxValues.ipi),
        )}
        {renderField(
          'PIS/COF (%)',
          product.taxRates.pisCofins,
          (v) => handleUpdate({ taxRates: { ...product.taxRates, pisCofins: Number(v) } }),
          'number',
          formatCurrency(financials.taxValues.pisCofins),
        )}
        {renderField(
          'ISS (%)',
          product.taxRates.iss,
          (v) => handleUpdate({ taxRates: { ...product.taxRates, iss: Number(v) } }),
          'number',
          formatCurrency(financials.taxValues.iss),
        )}
        {renderField(
          'Fator Venda',
          product.salesFactor,
          (v) => handleUpdate({ salesFactor: Number(v) }),
          'number',
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {renderField(
          'NF (%)',
          product.encargoRates.nf,
          (v) => handleUpdate({ encargoRates: { ...product.encargoRates, nf: Number(v) } }),
          'number',
          formatCurrency(financials.encargoValues.nf),
          'lg:col-start-3',
        )}
        {renderField(
          'Admin (%)',
          product.encargoRates.admin,
          (v) => handleUpdate({ encargoRates: { ...product.encargoRates, admin: Number(v) } }),
          'number',
          formatCurrency(financials.encargoValues.admin),
        )}
        {renderField(
          'Comissão (%)',
          product.encargoRates.comissao,
          (v) => handleUpdate({ encargoRates: { ...product.encargoRates, comissao: Number(v) } }),
          'number',
          formatCurrency(financials.encargoValues.comissao),
        )}
      </div>

      <Separator />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 bg-muted/30 p-4 rounded-lg">
        <div>
          <Label className="text-muted-foreground text-xs">Valor Total Compra</Label>
          <div className="font-semibold">{formatCurrency(financials.totalPurchaseCost)}</div>
        </div>
        <div>
          <Label className="text-muted-foreground text-xs">Valor Unitário Venda</Label>
          <div className="font-semibold">{formatCurrency(financials.unitSalePrice)}</div>
        </div>
        <div>
          <Label className="text-muted-foreground text-xs">Valor Total Venda</Label>
          <div className="font-semibold text-primary">
            {formatCurrency(financials.totalSalePrice)}
          </div>
        </div>
        <div>
          <Label className="text-muted-foreground text-xs">Valor Líquido</Label>
          <div className="font-semibold">{formatCurrency(financials.netValue)}</div>
        </div>
        <div>
          <Label className="text-muted-foreground text-xs">Margem Líquida</Label>
          <div className="font-semibold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(financials.netMargin)} ({financials.netMarginPercent.toFixed(1)}%)
          </div>
        </div>
      </div>
    </div>
  )
}
