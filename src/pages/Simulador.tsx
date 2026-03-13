import { useState, useMemo } from 'react'
import { Calculator, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatCurrency } from '@/lib/formatters'

export default function Simulador() {
  const [baseCost, setBaseCost] = useState(1000)
  const [targetPrice, setTargetPrice] = useState(2500)
  const [taxesPercent, setTaxesPercent] = useState(20)
  const [encargosPercent, setEncargosPercent] = useState(10)
  const [targetMarginPercent, setTargetMarginPercent] = useState(15)

  // Simulation 1: Given Target Price, what is the Factor and Margin?
  const sim1 = useMemo(() => {
    const factor = targetPrice / baseCost
    const netValue = targetPrice * (1 - taxesPercent / 100 - encargosPercent / 100)
    const margin = netValue - baseCost
    const marginPercent = (margin / targetPrice) * 100
    return { factor, margin, marginPercent }
  }, [baseCost, targetPrice, taxesPercent, encargosPercent])

  // Simulation 2: Given Target Price and Target Margin (%), what is the Max Purchase Cost?
  const sim2 = useMemo(() => {
    // Purchase Cost = Sale Price * (1 - Tax% - Encargos% - Margin%)
    const maxCost =
      targetPrice * (1 - taxesPercent / 100 - encargosPercent / 100 - targetMarginPercent / 100)
    const factor = targetPrice / maxCost
    return { maxCost, factor }
  }, [targetPrice, taxesPercent, encargosPercent, targetMarginPercent])

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Simulador de Alvos</h2>
        <p className="text-muted-foreground">
          Ferramenta de engenharia reversa para encontrar o Fator de Venda ideal ou Custo Máximo.
        </p>
      </div>

      <Tabs defaultValue="factor" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="factor">Descobrir Fator de Venda</TabsTrigger>
          <TabsTrigger value="cost">Descobrir Custo Máximo</TabsTrigger>
        </TabsList>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Card className="shadow-subtle">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-primary" />
                Parâmetros Base
              </CardTitle>
              <CardDescription>Insira as variáveis conhecidas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Preço Alvo de Venda (R$)</Label>
                <Input
                  type="number"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(Number(e.target.value))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Impostos Totais (%)</Label>
                  <Input
                    type="number"
                    value={taxesPercent}
                    onChange={(e) => setTaxesPercent(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Encargos Totais (%)</Label>
                  <Input
                    type="number"
                    value={encargosPercent}
                    onChange={(e) => setEncargosPercent(Number(e.target.value))}
                  />
                </div>
              </div>

              <TabsContent value="factor" className="space-y-2 mt-4">
                <Label>Custo de Compra (R$)</Label>
                <Input
                  type="number"
                  value={baseCost}
                  onChange={(e) => setBaseCost(Number(e.target.value))}
                />
              </TabsContent>

              <TabsContent value="cost" className="space-y-2 mt-4">
                <Label>Margem Alvo (%)</Label>
                <Input
                  type="number"
                  value={targetMarginPercent}
                  onChange={(e) => setTargetMarginPercent(Number(e.target.value))}
                />
              </TabsContent>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 shadow-subtle border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRight className="h-5 w-5 text-primary" />
                Resultados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TabsContent value="factor" className="space-y-6 m-0">
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Fator de Venda Necessário
                  </div>
                  <div className="text-4xl font-bold tracking-tight text-primary">
                    {sim1.factor.toFixed(4)}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-primary/10">
                  <div>
                    <div className="text-xs font-medium text-muted-foreground">Lucro Projetado</div>
                    <div className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(sim1.margin)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-muted-foreground">Margem %</div>
                    <div className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                      {sim1.marginPercent.toFixed(2)}%
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="cost" className="space-y-6 m-0">
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Custo Máximo Permitido
                  </div>
                  <div className="text-4xl font-bold tracking-tight text-primary">
                    {formatCurrency(sim2.maxCost)}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-primary/10">
                  <div>
                    <div className="text-xs font-medium text-muted-foreground">
                      Fator Resultante
                    </div>
                    <div className="text-lg font-semibold text-foreground">
                      {sim2.factor.toFixed(4)}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </CardContent>
          </Card>
        </div>
      </Tabs>
    </div>
  )
}
