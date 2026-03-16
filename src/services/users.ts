import { supabase } from '@/lib/supabase/client'

export async function fetchUsers() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function fetchInvitations() {
  const { data, error } = await supabase
    .from('user_invitations')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function updateUserRoleAndStatus(id: string, role: string, status: string) {
  const { error } = await supabase.from('profiles').update({ role, status }).eq('id', id)
  if (error) throw error
}

export async function inviteUser(email: string, role: string) {
  const { data, error } = await supabase
    .from('user_invitations')
    .insert({ email, role })
    .select('token')
    .single()
  if (error) throw error

  await supabase.functions.invoke('send-invite', {
    body: { email, role, token: data.token },
  })

  return data
}

export async function checkInvitation(token: string) {
  const { data } = await supabase
    .from('user_invitations')
    .select('*')
    .eq('token', token)
    .maybeSingle()
  return data
}

export async function acceptInvitation(token: string) {
  await supabase.from('user_invitations').update({ status: 'Accepted' }).eq('token', token)
}
