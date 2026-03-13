import { Product, FinancialResult } from '@/types'

export function calculateFinancials(product: Product, exchangeRate: number): FinancialResult {
  const costInBrl = product.currency === 'USD' ? product.unitCost * exchangeRate : product.unitCost

  const unitSalePrice = costInBrl * product.salesFactor
  const totalSalePrice = unitSalePrice * product.qty
  const totalPurchaseCost = costInBrl * product.qty

  const taxSumRate =
    (product.taxRates.icms +
      product.taxRates.ipi +
      product.taxRates.pisCofins +
      product.taxRates.iss) /
    100

  const encargoSumRate =
    (product.encargoRates.nf + product.encargoRates.admin + product.encargoRates.comissao) / 100

  const totalTaxesValue = totalSalePrice * taxSumRate
  const totalEncargosValue = totalSalePrice * encargoSumRate

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
