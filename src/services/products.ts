import { supabase } from '@/lib/supabase/client'

export const fetchProducts = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('updated_at', { ascending: false })

  if (error) throw error
  return data
}

export const fetchProductHistory = async (productId: string) => {
  const { data, error } = await supabase
    .from('product_price_history')
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export const syncProductsFromPricing = async (items: any[]) => {
  await Promise.all(
    items.map(async (item) => {
      if (!item.pn || item.pn === 'NOVO-ITEM') return

      const { data: existing } = await supabase
        .from('products')
        .select('*')
        .eq('part_number', item.pn)
        .maybeSingle()

      if (existing) {
        const priceChanged =
          Number(existing.current_unit_cost) !== Number(item.unitCost) ||
          existing.currency !== item.currency

        await supabase
          .from('products')
          .update({
            description: item.description || existing.description,
            manufacturer: item.manufacturer || existing.manufacturer,
            distributor: item.distributor || existing.distributor,
            current_unit_cost: item.unitCost,
            currency: item.currency,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id)

        if (priceChanged) {
          await supabase.from('product_price_history').insert({
            product_id: existing.id,
            unit_cost: item.unitCost,
            currency: item.currency,
          })
        }
      } else {
        const { data: newProd } = await supabase
          .from('products')
          .insert({
            part_number: item.pn,
            description: item.description,
            manufacturer: item.manufacturer,
            distributor: item.distributor,
            current_unit_cost: item.unitCost,
            currency: item.currency,
          })
          .select()
          .single()

        if (newProd) {
          await supabase.from('product_price_history').insert({
            product_id: newProd.id,
            unit_cost: item.unitCost,
            currency: item.currency,
          })
        }
      }
    }),
  )
}
