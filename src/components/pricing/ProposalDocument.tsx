import { Product } from '@/types'
import { calculateFinancials } from '@/lib/calculations'
import { formatCurrency } from '@/lib/formatters'
import { Profile } from '@/hooks/use-auth'

interface ProposalDocumentProps {
  clientData: any
  products: Product[]
  exchangeRate: number
  displayCurrency: 'BRL' | 'USD'
  profile: Profile | null
}

export function ProposalDocument({
  clientData,
  products,
  exchangeRate,
  displayCurrency,
  profile,
}: ProposalDocumentProps) {
  const total = products.reduce((acc, p) => {
    const f = calculateFinancials(p, exchangeRate)
    return acc + (displayCurrency === 'USD' ? f.totalSalePriceUsd : f.totalSalePrice)
  }, 0)

  return (
    <div className="max-w-[210mm] mx-auto p-12 bg-white text-slate-900 font-sans print:p-0 print:max-w-none print:w-full">
      {/* HEADER */}
      <div className="flex justify-between items-start mb-10">
        <div className="flex items-center gap-4">
          <img
            src="https://img.usecurling.com/i?q=leap+it&color=blue&shape=solid"
            alt="Leap IT"
            className="w-16 h-16 object-contain"
          />
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Leap IT</h1>
            <p className="text-sm font-medium text-slate-500">Soluções em Tecnologia</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">PROPOSTA COMERCIAL</h2>
          <p className="text-sm text-slate-600 mt-2">
            Nº: <span className="font-bold text-slate-800">{clientData.proposalNumber}</span>
          </p>
          <p className="text-sm text-slate-600">
            Data:{' '}
            <span className="font-medium text-slate-800">
              {new Date().toLocaleDateString('pt-BR')}
            </span>
          </p>
        </div>
      </div>

      {/* CLIENT INFO */}
      <div className="border-2 border-slate-200 rounded-xl p-5 mb-10 bg-slate-50/50 print:border-slate-300">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">
          Dados do Cliente
        </h3>
        <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
          <div>
            <span className="font-semibold text-slate-700 block text-xs">Empresa</span>
            <div className="text-slate-900 mt-0.5">{clientData.company || '-'}</div>
          </div>
          <div>
            <span className="font-semibold text-slate-700 block text-xs">CNPJ</span>
            <div className="text-slate-900 mt-0.5">{clientData.cnpj || '-'}</div>
          </div>
          <div>
            <span className="font-semibold text-slate-700 block text-xs">Contato</span>
            <div className="text-slate-900 mt-0.5">{clientData.contact || '-'}</div>
          </div>
          <div>
            <span className="font-semibold text-slate-700 block text-xs">Telefone</span>
            <div className="text-slate-900 mt-0.5">{clientData.phone || '-'}</div>
          </div>
          <div className="col-span-2">
            <span className="font-semibold text-slate-700 block text-xs">Email</span>
            <div className="text-slate-900 mt-0.5">{clientData.email || '-'}</div>
          </div>
          <div className="col-span-2">
            <span className="font-semibold text-slate-700 block text-xs">Endereço</span>
            <div className="text-slate-900 mt-0.5">{clientData.address || '-'}</div>
          </div>
        </div>
      </div>

      {/* PRODUCTS */}
      <div className="mb-10">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">
          Produtos e Serviços
        </h3>
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 border-y-2 border-slate-300 text-slate-700">
              <th className="py-3 px-2 font-semibold w-12 text-center">Item</th>
              <th className="py-3 px-2 font-semibold">Produto / PN</th>
              <th className="py-3 px-2 font-semibold">Descrição</th>
              <th className="py-3 px-2 font-semibold text-center w-16">Qtd</th>
              <th className="py-3 px-2 font-semibold text-right w-28">Vlr. Unit</th>
              <th className="py-3 px-2 font-semibold text-right w-32">Total</th>
            </tr>
          </thead>
          <tbody className="text-slate-700">
            {products.map((p, i) => {
              const f = calculateFinancials(p, exchangeRate)
              const unit = displayCurrency === 'USD' ? f.unitSalePriceUsd : f.unitSalePrice
              const tot = displayCurrency === 'USD' ? f.totalSalePriceUsd : f.totalSalePrice
              return (
                <tr key={p.id} className="border-b border-slate-200 last:border-0">
                  <td className="py-3 px-2 text-center text-slate-500 font-medium">{i + 1}</td>
                  <td className="py-3 px-2 font-semibold text-slate-900">{p.pn}</td>
                  <td className="py-3 px-2 text-xs leading-relaxed max-w-[250px]">
                    {p.description}
                  </td>
                  <td className="py-3 px-2 text-center font-medium">{p.qty}</td>
                  <td className="py-3 px-2 text-right tabular-nums">
                    {formatCurrency(unit, displayCurrency)}
                  </td>
                  <td className="py-3 px-2 text-right font-semibold text-slate-900 tabular-nums">
                    {formatCurrency(tot, displayCurrency)}
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-300 bg-slate-50">
              <td colSpan={4}></td>
              <td className="py-4 px-2 text-right font-bold text-slate-700 uppercase tracking-wide text-xs">
                Total Geral:
              </td>
              <td className="py-4 px-2 text-right font-bold text-slate-900 text-lg tabular-nums">
                {formatCurrency(total, displayCurrency)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* CONDITIONS */}
      <div className="mb-10" style={{ pageBreakInside: 'avoid' }}>
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">
          Condições Gerais de Fornecimento
        </h3>
        <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-200">
          {clientData.conditions}
        </div>
      </div>

      {/* FOOTER */}
      <div className="mt-16 pt-6 border-t-2 border-slate-200 text-xs text-slate-500 flex justify-between items-end">
        <div className="space-y-1">
          <p className="font-bold text-slate-700 text-sm">Leap IT - Soluções em Tecnologia</p>
          <p>Av. Paulista, 1000 - Bela Vista, São Paulo - SP</p>
          <p>contato@leapit.com.br | (11) 1234-5678</p>
        </div>
        <div className="text-right space-y-1">
          <p className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
            Gerado por
          </p>
          <p className="font-medium text-slate-900 text-sm">
            {profile?.name || 'Consultor Leap IT'}
          </p>
          <p>{profile?.email || ''}</p>
        </div>
      </div>
    </div>
  )
}
