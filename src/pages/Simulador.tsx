import { useState, useMemo } from 'react'
import { Calculator, ArrowRight, Target } from 'lucide-react'
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
    const factor = baseCost > 0 ? targetPrice / baseCost : 0
    const t = taxesPercent / 100
    const e = encargosPercent / 100

    const preliminaryNet = (targetPrice - baseCost) * (1 - t)
    const encargosValue = preliminaryNet * e
    const margin = preliminaryNet - encargosValue
    const marginPercent = targetPrice > 0 ? (margin / targetPrice) * 100 : 0

    return { factor, margin, marginPercent }
  }, [baseCost, targetPrice, taxesPercent, encargosPercent])

  // Simulation 2: Given Target Price and Target Margin (%), what is the Max Purchase Cost?
  const sim2 = useMemo(() => {
    const t = taxesPercent / 100
    const e = encargosPercent / 100
    const m = targetMarginPercent / 100

    const K = (1 - t) * (1 - e)
    const maxCost = K !== 0 ? targetPrice - (targetPrice * m) / K : 0
    const factor = maxCost > 0 ? targetPrice / maxCost : 0

    return { maxCost, factor }
  }, [targetPrice, taxesPercent, encargosPercent, targetMarginPercent])

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto w-full">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Simulador de Alvos</h2>
        <p className="text-muted-foreground">
          Ferramenta de engenharia reversa para encontrar o Fator de Venda ideal ou Custo Máximo.
        </p>
      </div>

      <Tabs defaultValue="factor" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="factor">Calcular Fator de Venda</TabsTrigger>
          <TabsTrigger value="cost">Calcular Custo de Compra</TabsTrigger>
        </TabsList>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Card className="shadow-subtle">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calculator className="h-5 w-5 text-primary" />
                Parâmetros Base
              </CardTitle>
              <CardDescription>Insira as variáveis conhecidas e o alvo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 bg-primary/5 p-4 rounded-lg border border-primary/10">
                <Label className="flex items-center gap-2 font-semibold text-primary">
                  <Target className="h-4 w-4" />
                  Valor Alvo (Objetivo de Venda em R$)
                </Label>
                <Input
                  type="number"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(Number(e.target.value))}
                  className="font-semibold text-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
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

              <TabsContent value="factor" className="space-y-2 pt-2">
                <Label>Custo de Compra Conhecido (R$)</Label>
                <Input
                  type="number"
                  value={baseCost}
                  onChange={(e) => setBaseCost(Number(e.target.value))}
                />
              </TabsContent>

              <TabsContent value="cost" className="space-y-2 pt-2">
                <Label>Margem Líquida Alvo (%)</Label>
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
              <CardTitle className="flex items-center gap-2 text-lg">
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
                  <div className="text-5xl font-bold tracking-tight text-primary">
                    {sim1.factor.toFixed(4)}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-primary/10">
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-1">
                      Lucro Projetado
                    </div>
                    <div className="text-xl font-semibold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(sim1.margin)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-1">Margem %</div>
                    <div className="text-xl font-semibold text-emerald-600 dark:text-emerald-400">
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
                  <div className="text-5xl font-bold tracking-tight text-primary">
                    {formatCurrency(sim2.maxCost)}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-primary/10">
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-1">
                      Fator de Venda Resultante
                    </div>
                    <div className="text-xl font-semibold text-foreground">
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
