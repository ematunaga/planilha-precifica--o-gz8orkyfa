import { Product, FinancialResult } from '@/types'

export function calculateFinancials(product: Product, exchangeRate: number): FinancialResult {
  const costInBrl = product.currency === 'USD' ? product.unitCost * exchangeRate : product.unitCost

  const totalPurchaseCost = costInBrl * product.qty
  const unitSalePrice = costInBrl * product.salesFactor
  const totalSalePrice = unitSalePrice * product.qty

  const taxValues = {
    icms:
      totalSalePrice * (product.taxRates.icms / 100) -
      totalPurchaseCost * (product.taxRates.icms / 100),
    ipi:
      totalSalePrice * (product.taxRates.ipi / 100) -
      totalPurchaseCost * (product.taxRates.ipi / 100),
    pisCofins:
      totalSalePrice * (product.taxRates.pisCofins / 100) -
      totalPurchaseCost * (product.taxRates.pisCofins / 100),
    iss:
      totalSalePrice * (product.taxRates.iss / 100) -
      totalPurchaseCost * (product.taxRates.iss / 100),
  }

  const encargoValues = {
    nf: totalSalePrice * (product.encargoRates.nf / 100),
    admin: totalSalePrice * (product.encargoRates.admin / 100),
    comissao: totalSalePrice * (product.encargoRates.comissao / 100),
  }

  const totalTaxesValue = taxValues.icms + taxValues.ipi + taxValues.pisCofins + taxValues.iss
  const totalEncargosValue = encargoValues.nf + encargoValues.admin + encargoValues.comissao

  const netValue = totalSalePrice - totalTaxesValue - totalEncargosValue
  const netMargin = netValue - totalPurchaseCost
  const netMarginPercent = totalSalePrice > 0 ? (netMargin / totalSalePrice) * 100 : 0

  return {
    unitSalePrice,
    totalSalePrice,
    totalPurchaseCost,
    totalTaxesValue,
    totalEncargosValue,
    netValue,
    netMargin,
    netMarginPercent,
    taxValues,
    encargoValues,
  }
}

export function calculateTotalMetrics(products: Product[], exchangeRate: number) {
  return products.reduce(
    (acc, product) => {
      const metrics = calculateFinancials(product, exchangeRate)
      return {
        totalPurchase: acc.totalPurchase + metrics.totalPurchaseCost,
        totalSale: acc.totalSale + metrics.totalSalePrice,
        totalProfit: acc.totalProfit + metrics.netMargin,
      }
    },
    { totalPurchase: 0, totalSale: 0, totalProfit: 0 },
  )
}
