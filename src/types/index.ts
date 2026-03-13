export type ProductType = 'HW' | 'SW' | 'Serviço'
export type Currency = 'BRL' | 'USD'
export type SalesModel = 'Direct' | 'Channel'

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
  st: number
  salesModel: SalesModel
  taxRates: TaxRates
  encargoRates: EncargoRates
  salesFactor: number
}

export interface FinancialResult {
  unitSalePrice: number
  totalSalePrice: number
  unitSalePriceUsd: number
  totalSalePriceUsd: number
  totalPurchaseCost: number
  totalTaxesValue: number
  totalStValue: number
  preliminaryNet: number
  totalEncargosValue: number
  netValue: number
  netMargin: number
  netMarginPercent: number
  taxValues: TaxRates
  encargoValues: EncargoRates
}

export interface ProjectVersion {
  id: string
  name: string
  date: string
  products: Product[]
  exchangeRate: number
}
