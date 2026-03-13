export type ProductType = 'HW' | 'SW' | 'Serviço'
export type Currency = 'BRL' | 'USD'

export interface TaxRates {
  icms: number
  ipi: number
  pisCofins: number
  iss: number
}

export interface EncargoRates {
  nf: number
  admin: number
  comissao: number
}

export interface Product {
  id: string
  pn: string
  description: string
  type: ProductType
  currency: Currency
  qty: number
  unitCost: number
  taxRates: TaxRates
  encargoRates: EncargoRates
  salesFactor: number
}

export interface FinancialResult {
  unitSalePrice: number
  totalSalePrice: number
  totalPurchaseCost: number
  totalTaxesValue: number
  totalEncargosValue: number
  netValue: number
  netMargin: number
  netMarginPercent: number
  taxValues: TaxRates
  encargoValues: EncargoRates
}
