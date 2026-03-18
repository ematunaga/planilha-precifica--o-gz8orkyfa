import { supabase } from '@/lib/supabase/client'
import { Product } from '@/types'
import { syncProductsFromPricing } from './products'

export const savePricingItems = async (versionId: string, projectId: string, items: Product[]) => {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const records = items.map((item) => ({
    part_number: item.pn,
    description: item.description,
    type: item.type,
    currency: item.currency,
    quantity: item.qty,
    unit_cost: item.unitCost,
    pis: item.taxRates.pis,
    cofins: item.taxRates.cofins,
    difal: item.difal,
    sales_factor: item.salesFactor,
    version_id: versionId,
    project_id: projectId,
    created_by: user?.id || null,
    manufacturer: item.manufacturer,
    distributor: item.distributor,
  }))

  const { error } = await supabase.from('pricing_items').insert(records)
  if (error) {
    console.error('Error saving pricing items to Supabase:', error)
    throw error
  }

  // Sync with Master List asynchronously to avoid blocking the save operation excessively
  syncProductsFromPricing(items).catch((err) => {
    console.error('Error syncing products with Master List:', err)
  })

  return true
}
