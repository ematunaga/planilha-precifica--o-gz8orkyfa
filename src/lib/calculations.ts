import { Product, FinancialResult } from '@/types'

export function calculateFinancials(product: Product, exchangeRate: number): FinancialResult {
  const costInBrl = product.currency === 'USD' ? product.unitCost * exchangeRate : product.unitCost

  const totalPurchaseCost = costInBrl * product.qty
  const unitSalePrice = costInBrl * product.salesFactor
  const totalSalePrice = unitSalePrice * product.qty

  const difalValueInBrl = totalPurchaseCost * (product.difal / 100)
  const totalDifalValue = difalValueInBrl

  const unitSalePriceUsd = unitSalePrice / exchangeRate
  const totalSalePriceUsd = totalSalePrice / exchangeRate

  const taxValues = {
    icms:
      totalSalePrice * (product.taxRates.icms / 100) -
      totalPurchaseCost * (product.taxRates.icms / 100),
    ipi:
      totalSalePrice * (product.taxRates.ipi / 100) -
      totalPurchaseCost * (product.taxRates.ipi / 100),
    pis:
      totalSalePrice * (product.taxRates.pis / 100) -
      totalPurchaseCost * (product.taxRates.pis / 100),
    cofins:
      totalSalePrice * (product.taxRates.cofins / 100) -
      totalPurchaseCost * (product.taxRates.cofins / 100),
    iss:
      totalSalePrice * (product.taxRates.iss / 100) -
      totalPurchaseCost * (product.taxRates.iss / 100),
  }

  const totalTaxesValue =
    taxValues.icms + taxValues.ipi + taxValues.pis + taxValues.cofins + taxValues.iss

  const preliminaryNet = totalSalePrice - totalPurchaseCost - totalTaxesValue - totalDifalValue

  const encargoValues = {
    nf: preliminaryNet * (product.encargoRates.nf / 100),
    admin: preliminaryNet * (product.encargoRates.admin / 100),
    comissao: preliminaryNet * (product.encargoRates.comissao / 100),
  }

  const totalEncargosValue = encargoValues.nf + encargoValues.admin + encargoValues.comissao

  const netMargin = preliminaryNet - totalEncargosValue
  const netValue = totalPurchaseCost + netMargin
  const netMarginPercent = totalSalePrice > 0 ? (netMargin / totalSalePrice) * 100 : 0

  return {
    unitSalePrice,
    totalSalePrice,
    unitSalePriceUsd,
    totalSalePriceUsd,
    totalPurchaseCost,
    totalTaxesValue,
    totalDifalValue,
    preliminaryNet,
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
        totalPurchaseUsd: acc.totalPurchaseUsd + metrics.totalPurchaseCost / exchangeRate,
        totalSaleUsd: acc.totalSaleUsd + metrics.totalSalePriceUsd,
        totalProfitUsd: acc.totalProfitUsd + metrics.netMargin / exchangeRate,
      }
    },
    {
      totalPurchase: 0,
      totalSale: 0,
      totalProfit: 0,
      totalPurchaseUsd: 0,
      totalSaleUsd: 0,
      totalProfitUsd: 0,
    },
  )
}
