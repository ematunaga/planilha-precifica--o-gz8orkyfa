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

export async function directCreateUser(
  email: string,
  password: string,
  name: string,
  role: string,
) {
  const { data, error } = await supabase.functions.invoke('create-user-admin', {
    body: { email, password, name, role },
  })

  if (error) {
    throw new Error('Erro de comunicação com o servidor.')
  }

  if (data?.error) {
    if (
      data.error.includes('already registered') ||
      data.error.includes('already been registered') ||
      data.error.includes('Email exists') ||
      data.error.includes('duplicate')
    ) {
      throw new Error('Este e-mail já está em uso.')
    }
    throw new Error(data.error)
  }

  return data
}

export async function directDeleteUser(userId: string) {
  const { data, error } = await supabase.functions.invoke('delete-user-admin', {
    body: { userId },
  })

  if (error) {
    throw new Error('Erro de comunicação com o servidor.')
  }

  if (data?.error) {
    throw new Error(data.error)
  }

  return data
}
