import { supabase } from '@/lib/supabase/client'
import { Product } from '@/types'

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
  }))

  const { error } = await supabase.from('pricing_items').insert(records)
  if (error) {
    console.error('Error saving pricing items to Supabase:', error)
    throw error
  }
  return true
}
