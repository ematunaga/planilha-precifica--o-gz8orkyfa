import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  Check,
  ChevronsUpDown,
  TrendingUp,
  TrendingDown,
  Minus,
  LineChart as LineChartIcon,
  Box,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/formatters'
import { fetchProducts, fetchProductHistory } from '@/services/products'
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

export default function DashboardPrecos() {
  const [products, setProducts] = useState<any[]>([])
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [history, setHistory] = useState<any[]>([])
  const [timeRange, setTimeRange] = useState('all')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    fetchProducts().then((data) => setProducts(data || []))
  }, [])

  useEffect(() => {
    if (selectedProduct) {
      fetchProductHistory(selectedProduct.id).then((data) => setHistory(data || []))
    } else {
      setHistory([])
    }
  }, [selectedProduct])

  const filteredHistory = useMemo(() => {
    if (!history) return []
    const now = new Date()
    let days = 0
    if (timeRange === '30') days = 30
    else if (timeRange === '90') days = 90
    else if (timeRange === '180') days = 180

    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    const currency = selectedProduct?.currency || 'BRL'

    const filtered = history.filter((h) => {
      const isSameCurrency = h.currency === currency
      const isAfterCutoff = days === 0 || new Date(h.created_at) >= cutoff
      return isSameCurrency && isAfterCutoff
    })

    return filtered.sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    )
  }, [history, timeRange, selectedProduct])

  const stats = useMemo(() => {
    if (filteredHistory.length === 0) return null

    const prices = filteredHistory.map((h) => Number(h.unit_cost))
    const current = prices[prices.length - 1]
    const first = prices[0]
    const min = Math.min(...prices)
    const max = Math.max(...prices)
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length
    const variation = first > 0 ? ((current - first) / first) * 100 : 0

    return { current, min, max, avg, variation }
  }, [filteredHistory])

  const chartData = filteredHistory.map((h) => ({
    date: new Date(h.created_at).toLocaleDateString('pt-BR'),
    price: Number(h.unit_cost),
  }))

  const chartConfig = { price: { label: 'Preço', color: 'hsl(var(--primary))' } }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full h-full">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard de Preços</h2>
        <p className="text-muted-foreground">Evolução e histórico de custos de produtos.</p>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full sm:w-[400px] justify-between shadow-sm"
            >
              {selectedProduct
                ? `${selectedProduct.part_number} - ${selectedProduct.description || ''}`
                : 'Buscar produto...'}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full sm:w-[400px] p-0">
            <Command>
              <CommandInput placeholder="Digite o Part Number ou descrição..." />
              <CommandList>
                <CommandEmpty>Nenhum produto encontrado.</CommandEmpty>
                <CommandGroup>
                  {products.map((p) => (
                    <CommandItem
                      key={p.id}
                      value={`${p.part_number} ${p.description || ''}`}
                      onSelect={() => {
                        setSelectedProduct(p)
                        setOpen(false)
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          selectedProduct?.id === p.id ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                      <span className="font-medium mr-2">{p.part_number}</span>
                      <span className="text-muted-foreground truncate">{p.description}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {selectedProduct && (
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={(val) => val && setTimeRange(val)}
            className="bg-background border rounded-md h-9 shadow-sm"
          >
            <ToggleGroupItem
              value="30"
              aria-label="30 Dias"
              className="h-full px-3 text-xs font-medium"
            >
              30 Dias
            </ToggleGroupItem>
            <ToggleGroupItem
              value="90"
              aria-label="90 Dias"
              className="h-full px-3 text-xs font-medium"
            >
              90 Dias
            </ToggleGroupItem>
            <ToggleGroupItem
              value="180"
              aria-label="6 Meses"
              className="h-full px-3 text-xs font-medium"
            >
              6 Meses
            </ToggleGroupItem>
            <ToggleGroupItem
              value="all"
              aria-label="Todo Período"
              className="h-full px-3 text-xs font-medium"
            >
              Todo Período
            </ToggleGroupItem>
          </ToggleGroup>
        )}
      </div>

      {!selectedProduct ? (
        <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed rounded-lg bg-card text-muted-foreground gap-3">
          <Box className="h-10 w-10 opacity-20" />
          <p className="font-medium">Selecione um produto para visualizar o dashboard.</p>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed rounded-lg bg-card text-muted-foreground gap-3">
          <LineChartIcon className="h-10 w-10 opacity-20" />
          <p className="font-medium">
            Nenhum histórico de preço encontrado para este produto no período selecionado.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="shadow-subtle">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Preço Atual
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(stats!.current, selectedProduct.currency)}
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-subtle">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Variação no Período
                </CardTitle>
                {stats!.variation > 0 ? (
                  <TrendingUp className="h-4 w-4 text-destructive" />
                ) : stats!.variation < 0 ? (
                  <TrendingDown className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Minus className="h-4 w-4 text-muted-foreground" />
                )}
              </CardHeader>
              <CardContent>
                <div
                  className={cn(
                    'text-2xl font-bold',
                    stats!.variation > 0
                      ? 'text-destructive'
                      : stats!.variation < 0
                        ? 'text-emerald-500'
                        : '',
                  )}
                >
                  {stats!.variation > 0 ? '+' : ''}
                  {stats!.variation.toFixed(2)}%
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-subtle">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Preço Médio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(stats!.avg, selectedProduct.currency)}
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-subtle">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Mínimo / Máximo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold">
                  {formatCurrency(stats!.min, selectedProduct.currency)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Máx: {formatCurrency(stats!.max, selectedProduct.currency)}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-subtle flex-1 min-h-[350px]">
            <CardHeader>
              <CardTitle>Evolução de Preço</CardTitle>
              <CardDescription>
                Histórico de variação do custo unitário em {selectedProduct.currency}.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ChartContainer config={chartConfig} className="h-full w-full">
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    minTickGap={30}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => formatCurrency(value, selectedProduct.currency)}
                    width={80}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value) =>
                          formatCurrency(Number(value), selectedProduct.currency)
                        }
                        labelFormatter={(label) => `Data: ${label}`}
                      />
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="var(--color-price)"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
