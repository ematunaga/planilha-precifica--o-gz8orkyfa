import { useMemo } from 'react'
import { Wallet, TrendingUp, Receipt } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useMainStore } from '@/stores/main'
import { calculateTotalMetrics } from '@/lib/calculations'
import { formatCurrency } from '@/lib/formatters'

export function SummaryCards() {
  const { products, exchangeRate } = useMainStore()

  const metrics = useMemo(
    () => calculateTotalMetrics(products, exchangeRate),
    [products, exchangeRate],
  )

  const marginPercent = metrics.totalSale > 0 ? (metrics.totalProfit / metrics.totalSale) * 100 : 0

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="shadow-subtle">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Custo Total Projetado
          </CardTitle>
          <Receipt className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tracking-tight text-foreground">
            {formatCurrency(metrics.totalPurchase)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Convertido considerando PTAX</p>
        </CardContent>
      </Card>

      <Card className="shadow-subtle">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Venda Total Projetada
          </CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tracking-tight text-foreground">
            {formatCurrency(metrics.totalSale)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Valor bruto para cliente final</p>
        </CardContent>
      </Card>

      <Card className="shadow-subtle bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
            Lucro Líquido Projetado
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tracking-tight text-emerald-700 dark:text-emerald-400">
            {formatCurrency(metrics.totalProfit)}
          </div>
          <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80 mt-1">
            Margem consolidada de {marginPercent.toFixed(1)}%
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
