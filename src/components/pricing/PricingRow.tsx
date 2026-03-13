import { useState, useRef } from 'react'
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import { TableCell, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useMainStore } from '@/stores/main'
import { Product } from '@/types'
import { calculateFinancials } from '@/lib/calculations'
import { formatCurrency, formatPercent, formatNumber } from '@/lib/formatters'
import { RowDetailsChart } from './RowDetailsChart'
import { ProductEditForm } from './ProductEditForm'
import { cn } from '@/lib/utils'

export function PricingRow({ product }: { product: Product }) {
  const { exchangeRate, updateProduct, removeProduct } = useMainStore()
  const [isOpen, setIsOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const financials = calculateFinancials(product, exchangeRate)
  const isPositive = financials.netMargin >= 0

  const handleFactorChange = (val: string) => {
    const num = parseFloat(val)
    if (!isNaN(num)) {
      updateProduct(product.id, { salesFactor: num })
    }
  }

  const badgeColor = {
    HW: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    SW: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    Serviço: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  }[product.type]

  const totalTaxRate =
    product.taxRates.icms + product.taxRates.ipi + product.taxRates.pisCofins + product.taxRates.iss
  const totalEncargoRate =
    product.encargoRates.nf + product.encargoRates.admin + product.encargoRates.comissao

  return (
    <>
      <TableRow
        className="group hover:bg-muted/50 cursor-pointer transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <TableCell>
          <div className="font-medium text-foreground">{product.pn}</div>
          <div
            className="text-xs text-muted-foreground truncate max-w-[200px]"
            title={product.description}
          >
            {product.description}
          </div>
        </TableCell>
        <TableCell>
          <Badge variant="outline" className={cn('border-transparent font-semibold', badgeColor)}>
            {product.type}
          </Badge>
        </TableCell>
        <TableCell className="text-right whitespace-nowrap">
          <div className="font-medium">{product.qty}x</div>
          <div className="text-xs text-muted-foreground">{product.currency}</div>
        </TableCell>
        <TableCell className="text-right">
          <div>{formatCurrency(product.unitCost, product.currency)}</div>
          <div className="text-xs text-muted-foreground">
            {formatCurrency(financials.totalPurchaseCost)} total
          </div>
        </TableCell>
        <TableCell className="text-right hidden md:table-cell">
          <Tooltip>
            <TooltipTrigger className="cursor-help underline decoration-dashed underline-offset-4">
              {formatPercent(totalTaxRate)}
            </TooltipTrigger>
            <TooltipContent>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <span>ICMS:</span>
                <span className="text-right">{formatPercent(product.taxRates.icms)}</span>
                <span>IPI:</span>
                <span className="text-right">{formatPercent(product.taxRates.ipi)}</span>
                <span>PIS/COF:</span>
                <span className="text-right">{formatPercent(product.taxRates.pisCofins)}</span>
                <span>ISS:</span>
                <span className="text-right">{formatPercent(product.taxRates.iss)}</span>
              </div>
            </TooltipContent>
          </Tooltip>
        </TableCell>
        <TableCell className="text-right hidden lg:table-cell">
          <Tooltip>
            <TooltipTrigger className="cursor-help underline decoration-dashed underline-offset-4">
              {formatPercent(totalEncargoRate)}
            </TooltipTrigger>
            <TooltipContent>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <span>NF:</span>
                <span className="text-right">{formatPercent(product.encargoRates.nf)}</span>
                <span>Admin:</span>
                <span className="text-right">{formatPercent(product.encargoRates.admin)}</span>
                <span>Comissão:</span>
                <span className="text-right">{formatPercent(product.encargoRates.comissao)}</span>
              </div>
            </TooltipContent>
          </Tooltip>
        </TableCell>
        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
          <div className="flex flex-col items-end gap-1">
            <Input
              ref={inputRef}
              type="number"
              step="0.01"
              value={product.salesFactor}
              onChange={(e) => handleFactorChange(e.target.value)}
              className="h-7 w-20 text-right font-mono text-sm"
            />
            <div className="text-xs font-medium text-primary">
              {formatCurrency(financials.unitSalePrice)}
            </div>
          </div>
        </TableCell>
        <TableCell className="text-right">
          <div
            className={cn(
              'font-bold',
              isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive',
            )}
          >
            {formatCurrency(financials.netMargin)}
          </div>
          <div
            className={cn(
              'text-xs font-medium',
              isPositive ? 'text-emerald-600/80' : 'text-destructive/80',
            )}
          >
            {formatNumber(financials.netMarginPercent, 1)}%
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
              onClick={() => removeProduct(product.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground shrink-0"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </TableCell>
      </TableRow>

      {isOpen && (
        <TableRow className="bg-muted/10 hover:bg-muted/10 border-b-2 border-primary/20">
          <TableCell colSpan={9} className="p-4">
            <div className="animate-in slide-in-from-top-2 fade-in duration-200">
              <div className="flex flex-col xl:flex-row gap-6">
                <div className="flex-1">
                  <ProductEditForm product={product} financials={financials} />
                </div>
                <div className="w-full xl:w-[350px] flex items-center justify-center bg-card rounded-lg border p-4 shadow-sm shrink-0">
                  <RowDetailsChart financials={financials} />
                </div>
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  )
}
