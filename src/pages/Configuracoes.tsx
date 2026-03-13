import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useMainStore } from '@/stores/main'

export default function Configuracoes() {
  const { exchangeRate, setExchangeRate } = useMainStore()

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Configurações Globais</h2>
        <p className="text-muted-foreground">Ajuste as taxas padrão e configurações do sistema.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Moeda e Câmbio</CardTitle>
          <CardDescription>
            Defina a taxa de câmbio utilizada para conversão de custos em USD.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 max-w-[200px]">
            <Label>Dólar PTAX (R$)</Label>
            <Input
              type="number"
              step="0.01"
              value={exchangeRate}
              onChange={(e) => setExchangeRate(Number(e.target.value))}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
