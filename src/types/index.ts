export type ProductType = 'HW' | 'SW' | 'Serviço'
export type Currency = 'BRL' | 'USD'
export type SalesModel = 'Direct' | 'Channel'

export type UserRole = 'Admin' | 'Editor' | 'Viewer'
export type UserStatus = 'Pending' | 'Authorized' | 'Revoked'

export interface User {
  id: string
  name: string
  email: string
  password: string
  role: UserRole
  status: UserStatus
}

export interface TaxRates {
  icms: number
  ipi: number
  pis: number
  cofins: number
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
  difal: number
  salesModel: SalesModel
  taxRates: TaxRates
  encargoRates: EncargoRates
  salesFactor: number
  manufacturer?: string
  distributor?: string
}

export interface FinancialResult {
  unitSalePrice: number
  totalSalePrice: number
  unitSalePriceUsd: number
  totalSalePriceUsd: number
  totalPurchaseCost: number
  totalTaxesValue: number
  totalDifalValue: number
  preliminaryNet: number
  totalEncargosValue: number
  netValue: number
  netMargin: number
  netMarginPercent: number
  taxValues: TaxRates
  encargoValues: EncargoRates
}

export interface Folder {
  id: string
  name: string
  createdBy?: string
}

export interface Project {
  id: string
  folderId: string
  name: string
  templateId?: string
  createdBy?: string
  isPublic?: boolean
}

export interface PricingTemplate {
  id: string
  name: string
  taxRates: TaxRates
  encargoRates: EncargoRates
}

export interface ProjectVersion {
  id: string
  projectId: string
  name: string
  date: string
  products: Product[]
  exchangeRate: number
  createdBy?: string
}

export interface ProposalCondition {
  id: string
  name: string
  content: string
  type: 'distributor' | 'leapit'
}

export interface ProposalRecord {
  id: string
  projectId: string
  versionId?: string
  fileName: string
  proposalNumber: number
  versionNumber: number
  clientName: string
  createdAt: string
  createdBy?: string
}
