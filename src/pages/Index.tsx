import { SummaryCards } from '@/components/pricing/SummaryCards'
import { PricingTable } from '@/components/pricing/PricingTable'

const Index = () => {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Visão geral da precificação, margens e simulações do projeto atual.
        </p>
      </div>

      <SummaryCards />

      <PricingTable />
    </div>
  )
}

export default Index
