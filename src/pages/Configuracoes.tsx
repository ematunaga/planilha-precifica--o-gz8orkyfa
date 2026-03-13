import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useMainStore } from '@/stores/main'
import useAuthStore from '@/stores/auth'
import { RefreshCw, Trash2, Bookmark } from 'lucide-react'
import { toast } from 'sonner'
import { formatPercent } from '@/lib/formatters'
import { Navigate } from 'react-router-dom'

export default function Configuracoes() {
  const { currentUser } = useAuthStore()
  const {
    exchangeRate,
    setExchangeRate,
    fetchExchangeRate,
    lastExchangeUpdate,
    templates,
    deleteTemplate,
  } = useMainStore()

  if (currentUser?.role !== 'Admin') {
    return <Navigate to="/" replace />
  }

  const handleUpdateExchange = async () => {
    await fetchExchangeRate()
    toast.success('Cotação atualizada via API!')
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto w-full">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Configurações Globais</h2>
        <p className="text-muted-foreground">
          Ajuste as taxas padrão, câmbio e templates do sistema.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Moeda e Câmbio</CardTitle>
          <CardDescription>
            Defina a taxa de câmbio utilizada para conversão de custos em USD. Atualize
            automaticamente utilizando a API do Banco Central / AwesomeAPI.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            <div className="space-y-2 w-full max-w-[200px]">
              <Label>Dólar PTAX (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={exchangeRate}
                onChange={(e) => setExchangeRate(Number(e.target.value))}
              />
            </div>
            <div className="flex items-center gap-4">
              <Button variant="secondary" onClick={handleUpdateExchange}>
                <RefreshCw className="mr-2 h-4 w-4" /> Sincronizar Cotação
              </Button>
            </div>
          </div>
          {lastExchangeUpdate && (
            <p className="text-xs text-muted-foreground">
              Última sincronização com sucesso: {new Date(lastExchangeUpdate).toLocaleString()}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Meus Templates de Precificação</CardTitle>
          <CardDescription>
            Gerencie os templates salvos. Templates preenchem automaticamente as taxas de impostos e
            encargos em novos projetos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {templates.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground border-2 border-dashed rounded-lg bg-muted/10">
              <Bookmark className="h-8 w-8 mx-auto mb-2 opacity-50" />
              Nenhum template salvo. Salve templates a partir da planilha de precificação.
            </div>
          ) : (
            <div className="space-y-3">
              {templates.map((tpl) => {
                const totalTax =
                  tpl.taxRates.icms + tpl.taxRates.ipi + tpl.taxRates.pisCofins + tpl.taxRates.iss
                const totalEnc =
                  tpl.encargoRates.nf + tpl.encargoRates.admin + tpl.encargoRates.comissao
                return (
                  <div
                    key={tpl.id}
                    className="flex items-center justify-between p-4 border rounded-lg bg-card"
                  >
                    <div>
                      <h4 className="font-semibold text-sm">{tpl.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Impostos Totais: {formatPercent(totalTax)} | Encargos:{' '}
                        {formatPercent(totalEnc)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => {
                        deleteTemplate(tpl.id)
                        toast.success('Template excluído')
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
