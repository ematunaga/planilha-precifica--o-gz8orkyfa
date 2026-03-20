import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useMainStore } from '@/stores/main'
import { useAuth } from '@/hooks/use-auth'
import { RefreshCw, Trash2, Bookmark, Plus, Edit2 } from 'lucide-react'
import { toast } from 'sonner'
import { formatPercent } from '@/lib/formatters'
import { Navigate } from 'react-router-dom'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ProposalCondition } from '@/types'

export default function Configuracoes() {
  const { profile } = useAuth()
  const {
    exchangeRate,
    setExchangeRate,
    fetchExchangeRate,
    lastExchangeUpdate,
    templates,
    deleteTemplate,
    proposalConditions,
    saveProposalCondition,
    deleteProposalCondition,
  } = useMainStore()

  const [isConditionDialogOpen, setIsConditionDialogOpen] = useState(false)
  const [editingCondition, setEditingCondition] = useState<Partial<ProposalCondition> | null>(null)

  if (profile?.role !== 'Admin') {
    return <Navigate to="/" replace />
  }

  const handleUpdateExchange = async () => {
    await fetchExchangeRate()
    toast.success('Cotação atualizada via API!')
  }

  const handleSaveCondition = async () => {
    if (!editingCondition?.name || !editingCondition?.content) {
      toast.error('Preencha o nome e o conteúdo da condição.')
      return
    }

    try {
      await saveProposalCondition(
        {
          name: editingCondition.name,
          content: editingCondition.content,
          type: editingCondition.type || 'distributor',
        },
        editingCondition.id,
      )

      toast.success('Condição salva com sucesso!')
      setIsConditionDialogOpen(false)
      setEditingCondition(null)
    } catch (e: any) {
      toast.error('Erro ao salvar condição.')
    }
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto w-full pb-10">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Configurações Globais</h2>
        <p className="text-muted-foreground">
          Ajuste as taxas padrão, câmbio, templates e textos legais do sistema.
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
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Condições Gerais de Fornecimento</CardTitle>
            <CardDescription>
              Gerencie os textos de condições gerais usados na geração de propostas PDF.
            </CardDescription>
          </div>
          <Button
            size="sm"
            onClick={() => {
              setEditingCondition({ type: 'distributor', name: '', content: '' })
              setIsConditionDialogOpen(true)
            }}
          >
            <Plus className="h-4 w-4 mr-2" /> Nova Condição
          </Button>
        </CardHeader>
        <CardContent>
          {proposalConditions.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground border-2 border-dashed rounded-lg bg-muted/10">
              Nenhuma condição configurada.
            </div>
          ) : (
            <div className="space-y-3">
              {proposalConditions.map((cond) => (
                <div
                  key={cond.id}
                  className="flex items-start justify-between p-4 border rounded-lg bg-card"
                >
                  <div className="flex-1 pr-4">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-sm">{cond.name}</h4>
                      <span className="text-[10px] bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full uppercase font-medium">
                        {cond.type === 'leapit' ? 'Leap IT (Canal)' : 'Distribuidor'}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 whitespace-pre-wrap">
                      {cond.content}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-primary"
                      onClick={() => {
                        setEditingCondition(cond)
                        setIsConditionDialogOpen(true)
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={async () => {
                        await deleteProposalCondition(cond.id)
                        toast.success('Condição excluída')
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
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

      <Dialog open={isConditionDialogOpen} onOpenChange={setIsConditionDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingCondition?.id ? 'Editar Condição' : 'Nova Condição Geral'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome (ex: TD Synnex, Leap IT - Canal)</Label>
                <Input
                  value={editingCondition?.name || ''}
                  onChange={(e) =>
                    setEditingCondition({ ...editingCondition, name: e.target.value })
                  }
                  placeholder="Nome do Distribuidor ou Leap IT"
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select
                  value={editingCondition?.type || 'distributor'}
                  onValueChange={(val: 'distributor' | 'leapit') =>
                    setEditingCondition({ ...editingCondition, type: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="distributor">Distribuidor</SelectItem>
                    <SelectItem value="leapit">Leap IT (Venda Canal)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Texto das Condições</Label>
              <Textarea
                value={editingCondition?.content || ''}
                onChange={(e) =>
                  setEditingCondition({ ...editingCondition, content: e.target.value })
                }
                className="min-h-[250px] font-mono text-xs"
                placeholder="Insira as cláusulas e condições de fornecimento..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConditionDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveCondition}>Salvar Condição</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
