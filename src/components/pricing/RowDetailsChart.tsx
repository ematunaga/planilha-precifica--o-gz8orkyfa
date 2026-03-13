import { useMemo } from 'react'
import { Cell, Pie, PieChart } from 'recharts'
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { formatCurrency } from '@/lib/formatters'
import { FinancialResult } from '@/types'

const chartConfig = {
  value: { label: 'Valor' },
  cost: { label: 'Custo Compra', color: 'hsl(var(--chart-1))' },
  taxes: { label: 'Impostos', color: 'hsl(var(--chart-2))' },
  st: { label: 'ST', color: 'hsl(var(--chart-4))' },
  encargos: { label: 'Encargos', color: 'hsl(var(--chart-5))' },
  profit: { label: 'Lucro Líquido', color: 'hsl(var(--chart-3))' },
} satisfies ChartConfig

export function RowDetailsChart({ financials }: { financials: FinancialResult }) {
  const chartData = useMemo(() => {
    const data = [
      { name: 'Custo Compra', value: financials.totalPurchaseCost, fill: 'var(--color-cost)' },
      { name: 'Impostos', value: financials.totalTaxesValue, fill: 'var(--color-taxes)' },
    ]
    if (financials.totalStValue > 0) {
      data.push({ name: 'ST', value: financials.totalStValue, fill: 'var(--color-st)' })
    }
    data.push(
      { name: 'Encargos', value: financials.totalEncargosValue, fill: 'var(--color-encargos)' },
      {
        name: 'Lucro Líquido',
        value: Math.max(0, financials.netMargin),
        fill: 'var(--color-profit)',
      },
    )
    return data
  }, [financials])

  return (
    <div className="flex items-center justify-center p-4">
      <ChartContainer config={chartConfig} className="w-full max-w-[400px] h-[250px]">
        <PieChart>
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent formatter={(value: number) => formatCurrency(value)} />}
          />
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            innerRadius={60}
            outerRadius={80}
            strokeWidth={2}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <ChartLegend content={<ChartLegendContent />} className="flex-wrap" />
        </PieChart>
      </ChartContainer>
    </div>
  )
}
