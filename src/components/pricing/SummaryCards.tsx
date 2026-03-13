import { useMemo } from 'react'
import { Wallet, TrendingUp, Receipt } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useMainStore } from '@/stores/main'
import { calculateTotalMetrics } from '@/lib/calculations'
import { formatCurrency } from '@/lib/formatters'

export function SummaryCards() {
  const { products, exchangeRate, displayCurrency } = useMainStore()

  const metrics = useMemo(
    () => calculateTotalMetrics(products, exchangeRate),
    [products, exchangeRate],
  )

  const isBrl = displayCurrency === 'BRL'
  const marginPercent = metrics.totalSale > 0 ? (metrics.totalProfit / metrics.totalSale) * 100 : 0

  const purchaseMain = isBrl ? metrics.totalPurchase : metrics.totalPurchaseUsd
  const purchaseSub = isBrl ? metrics.totalPurchaseUsd : metrics.totalPurchase

  const saleMain = isBrl ? metrics.totalSale : metrics.totalSaleUsd
  const saleSub = isBrl ? metrics.totalSaleUsd : metrics.totalSale

  const profitMain = isBrl ? metrics.totalProfit : metrics.totalProfitUsd
  const profitSub = isBrl ? metrics.totalProfitUsd : metrics.totalProfit

  const currMain = isBrl ? 'BRL' : 'USD'
  const currSub = isBrl ? 'USD' : 'BRL'

  return (
    <div className="grid gap-4 md:grid-cols-3 no-break-inside">
      <Card className="shadow-subtle print:shadow-none print:border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground print:text-black">
            Custo Total Projetado
          </CardTitle>
          <Receipt className="h-4 w-4 text-muted-foreground print:hidden" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tracking-tight text-foreground print:text-black">
            {formatCurrency(purchaseMain, currMain)}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-md print:bg-transparent print:p-0 print:text-gray-600">
              {formatCurrency(purchaseSub, currSub)}
            </span>
            <span className="text-[10px] text-muted-foreground print:hidden">Ref. PTAX</span>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-subtle print:shadow-none print:border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground print:text-black">
            Venda Total Projetada
          </CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground print:hidden" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tracking-tight text-foreground print:text-black">
            {formatCurrency(saleMain, currMain)}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-md print:bg-transparent print:p-0 print:text-gray-600">
              {formatCurrency(saleSub, currSub)}
            </span>
            <span className="text-[10px] text-muted-foreground print:hidden">Bruto cliente</span>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-subtle bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/50 print:bg-white print:border-border print:shadow-none">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-400 print:text-black">
            Lucro Líquido Projetado
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400 print:hidden" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tracking-tight text-emerald-700 dark:text-emerald-400 print:text-black">
            {formatCurrency(profitMain, currMain)}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs font-medium text-emerald-600/80 dark:text-emerald-400/80 bg-emerald-100/50 dark:bg-emerald-900/50 px-2 py-0.5 rounded-md print:bg-transparent print:p-0 print:text-gray-600">
              {formatCurrency(profitSub, currSub)}
            </span>
            <span className="text-[10px] text-emerald-600/70 dark:text-emerald-400/70 font-medium print:text-gray-600">
              Margem {marginPercent.toFixed(1)}%
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
