import { useState, useMemo, useEffect } from 'react'
import { Calculator, ArrowRight, Target, Info, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { formatCurrency, formatPercent } from '@/lib/formatters'
import { useMainStore } from '@/stores/main'
import { toast } from 'sonner'

export default function Simulador() {
  const { products, exchangeRate, updateProduct } = useMainStore()

  const projectSim = useMemo(() => {
    let A = 0
    let B = 0
    let currentSale = 0
    let currentCost = 0

    products.forEach((p) => {
      const costInBrl = p.currency === 'USD' ? p.unitCost * exchangeRate : p.unitCost
      const stInBrl = p.currency === 'USD' ? p.st * exchangeRate : p.st

      const C_i = costInBrl * p.qty
      const S_i = C_i * p.salesFactor
      const ST_i = stInBrl * p.qty

      const t_i = (p.taxRates.icms + p.taxRates.ipi + p.taxRates.pisCofins + p.taxRates.iss) / 100
      const e_i = (p.encargoRates.nf + p.encargoRates.admin + p.encargoRates.comissao) / 100
      const K_i = (1 - t_i) * (1 - e_i)

      A += S_i * K_i
      B += C_i * K_i + ST_i * (1 - e_i)
      currentSale += S_i
      currentCost += C_i
    })

    return { A, B, currentSale, currentCost }
  }, [products, exchangeRate])

  const [targetPrice, setTargetPrice] = useState<number>(0)
  const [targetMarginPercent, setTargetMarginPercent] = useState<number>(15)

  useEffect(() => {
    if (targetPrice === 0 && projectSim.currentSale > 0) {
      setTargetPrice(projectSim.currentSale)
    }
  }, [projectSim.currentSale, targetPrice])

  // Simulation 1: Given Target Sale Price
  const sim1 = useMemo(() => {
    const M = projectSim.currentSale > 0 ? targetPrice / projectSim.currentSale : 0
    const newProfit = M * projectSim.A - projectSim.B
    const newMarginPercent = targetPrice > 0 ? (newProfit / targetPrice) * 100 : 0
    const newAvgFactor = projectSim.currentCost > 0 ? targetPrice / projectSim.currentCost : 0

    return { M, newProfit, newMarginPercent, newAvgFactor }
  }, [targetPrice, projectSim])

  // Simulation 2: Given Target Margin %
  const sim2 = useMemo(() => {
    const m_target = targetMarginPercent / 100
    const denom = projectSim.A - m_target * projectSim.currentSale

    if (denom <= 0 || projectSim.currentSale === 0) {
      return { requiredSale: 0, M: 0, newAvgFactor: 0, newProfit: 0 }
    }

    const M = projectSim.B / denom
    const requiredSale = M * projectSim.currentSale
    const newAvgFactor = projectSim.currentCost > 0 ? requiredSale / projectSim.currentCost : 0
    const newProfit = requiredSale * m_target

    return { requiredSale, M, newAvgFactor, newProfit }
  }, [targetMarginPercent, projectSim])

  const applyMultiplier = (multiplier: number) => {
    if (multiplier <= 0) return
    products.forEach((p) => {
      updateProduct(p.id, { salesFactor: p.salesFactor * multiplier })
    })
    toast.success('Fatores de venda atualizados em todo o projeto!')
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto w-full">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Simulador do Projeto</h2>
        <p className="text-muted-foreground">
          Simule metas financeiras para todo o projeto atual. O simulador considera a estrutura em
          cascata de impostos e encargos de cada item.
        </p>
      </div>

      {products.length === 0 ? (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Adicione produtos ao projeto para utilizar o simulador.
          </AlertDescription>
        </Alert>
      ) : (
        <Tabs defaultValue="price" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="price">Alvo: Preço de Venda</TabsTrigger>
            <TabsTrigger value="margin">Alvo: Margem Líquida %</TabsTrigger>
          </TabsList>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <Card className="shadow-subtle border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calculator className="h-5 w-5 text-primary" />
                  Parâmetros de Simulação
                </CardTitle>
                <CardDescription>Defina sua meta financeira global</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <TabsContent value="price" className="m-0 space-y-4">
                  <div className="space-y-2 bg-primary/5 p-4 rounded-lg border border-primary/10">
                    <Label className="flex items-center gap-2 font-semibold text-primary">
                      <Target className="h-4 w-4" />
                      Valor Alvo do Projeto (R$)
                    </Label>
                    <Input
                      type="number"
                      value={targetPrice}
                      onChange={(e) => setTargetPrice(Number(e.target.value))}
                      className="font-semibold text-lg"
                    />
                    <p className="text-xs text-muted-foreground pt-1">
                      Venda atual: {formatCurrency(projectSim.currentSale)}
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="margin" className="m-0 space-y-4">
                  <div className="space-y-2 bg-primary/5 p-4 rounded-lg border border-primary/10">
                    <Label className="flex items-center gap-2 font-semibold text-primary">
                      <Target className="h-4 w-4" />
                      Margem Líquida Alvo (%)
                    </Label>
                    <Input
                      type="number"
                      value={targetMarginPercent}
                      onChange={(e) => setTargetMarginPercent(Number(e.target.value))}
                      className="font-semibold text-lg"
                    />
                    <p className="text-xs text-muted-foreground pt-1">
                      Margem atual:{' '}
                      {formatPercent(
                        projectSim.currentSale > 0
                          ? ((projectSim.A - projectSim.B) / projectSim.currentSale) * 100
                          : 0,
                      )}
                    </p>
                  </div>
                </TabsContent>

                <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm text-muted-foreground border">
                  <div className="flex justify-between">
                    <span>Custo Total Base (R$):</span>
                    <span className="font-medium text-foreground">
                      {formatCurrency(projectSim.currentCost)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fator Médio Atual:</span>
                    <span className="font-medium text-foreground">
                      {projectSim.currentCost > 0
                        ? (projectSim.currentSale / projectSim.currentCost).toFixed(4)
                        : '0.0000'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 shadow-subtle border-primary/20 flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ArrowRight className="h-5 w-5 text-primary" />
                  Resultados da Simulação
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <TabsContent value="price" className="space-y-6 m-0 flex-1">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">
                      Novo Fator Médio Necessário
                    </div>
                    <div className="text-5xl font-bold tracking-tight text-primary">
                      {sim1.newAvgFactor.toFixed(4)}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-6 border-t border-primary/10">
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-1">
                        Lucro Projetado
                      </div>
                      <div className="text-xl font-semibold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(sim1.newProfit)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-1">
                        Margem (%)
                      </div>
                      <div className="text-xl font-semibold text-emerald-600 dark:text-emerald-400">
                        {sim1.newMarginPercent.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                  <div className="pt-6 mt-auto">
                    <Button onClick={() => applyMultiplier(sim1.M)} className="w-full">
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Aplicar ao Projeto
                    </Button>
                    <p className="text-[10px] text-center text-muted-foreground mt-2">
                      Multiplica os fatores de venda de todos os itens por {sim1.M.toFixed(4)}.
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="margin" className="space-y-6 m-0 flex-1">
                  {sim2.M === 0 ? (
                    <div className="text-destructive font-medium">Meta inatingível.</div>
                  ) : (
                    <>
                      <div>
                        <div className="text-sm font-medium text-muted-foreground mb-1">
                          Venda Total Necessária (R$)
                        </div>
                        <div className="text-5xl font-bold tracking-tight text-primary">
                          {formatCurrency(sim2.requiredSale)}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-6 border-t border-primary/10">
                        <div>
                          <div className="text-xs font-medium text-muted-foreground mb-1">
                            Novo Fator Médio
                          </div>
                          <div className="text-xl font-semibold text-foreground">
                            {sim2.newAvgFactor.toFixed(4)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs font-medium text-muted-foreground mb-1">
                            Lucro Projetado
                          </div>
                          <div className="text-xl font-semibold text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(sim2.newProfit)}
                          </div>
                        </div>
                      </div>
                      <div className="pt-6 mt-auto">
                        <Button onClick={() => applyMultiplier(sim2.M)} className="w-full">
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Aplicar ao Projeto
                        </Button>
                        <p className="text-[10px] text-center text-muted-foreground mt-2">
                          Multiplica os fatores de venda de todos os itens por {sim2.M.toFixed(4)}.
                        </p>
                      </div>
                    </>
                  )}
                </TabsContent>
              </CardContent>
            </Card>
          </div>
        </Tabs>
      )}
    </div>
  )
}
