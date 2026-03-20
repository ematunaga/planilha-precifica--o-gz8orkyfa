import { supabase } from '@/lib/supabase/client'

export async function fetchApiKeys() {
  const { data, error } = await supabase
    .from('api_keys')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function createApiKey(name: string) {
  const token = `leap_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('api_keys')
    .insert({ name, token, created_by: user?.id })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteApiKey(id: string) {
  const { error } = await supabase.from('api_keys').delete().eq('id', id)
  if (error) throw error
}
