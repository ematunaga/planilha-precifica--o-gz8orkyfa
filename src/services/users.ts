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

export async function inviteUser(email: string, role: string, origin: string) {
  const { data, error } = await supabase
    .from('user_invitations')
    .insert({ email, role })
    .select('token')
    .single()

  if (error) {
    if (error.code === '23505') {
      throw new Error('Este e-mail já possui um convite pendente ou ativo.')
    }
    throw new Error(error.message)
  }

  const { error: invokeError } = await supabase.functions.invoke('send-invite', {
    body: { email, role, token: data.token, origin },
  })

  if (invokeError) {
    throw new Error('Erro ao enviar o e-mail de convite pela Edge Function.')
  }

  return data
}

export async function deleteInvitation(id: string) {
  const { error } = await supabase.from('user_invitations').delete().eq('id', id)
  if (error) throw new Error('Erro ao excluir convite.')
}

export async function resendInvitation(email: string, role: string, token: string, origin: string) {
  const { error: invokeError } = await supabase.functions.invoke('send-invite', {
    body: { email, role, token, origin },
  })

  if (invokeError) {
    throw new Error('Erro ao reenviar o e-mail de convite.')
  }
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
