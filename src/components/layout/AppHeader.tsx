import { DollarSign, Plus } from 'lucide-react'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useMainStore } from '@/stores/main'

export function AppHeader() {
  const { exchangeRate, setExchangeRate } = useMainStore()

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-2 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div className="hidden h-6 w-px bg-border md:block" />
        <h1 className="text-sm font-medium hidden sm:block">Painel de Precificação</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-1.5 shadow-sm">
          <DollarSign className="size-4 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground hidden sm:inline">
            Câmbio (USD):
          </span>
          <Input
            type="number"
            step="0.01"
            value={exchangeRate}
            onChange={(e) => setExchangeRate(parseFloat(e.target.value) || 0)}
            className="h-6 w-16 border-none bg-transparent p-0 text-xs font-bold focus-visible:ring-0"
          />
        </div>
        <Button size="sm" className="gap-2">
          <Plus className="size-4" />
          <span className="hidden sm:inline">Novo Produto</span>
        </Button>
      </div>
    </header>
  )
}
