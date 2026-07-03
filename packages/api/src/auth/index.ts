export { useSession, useSessionSubscription } from '../queries/useSession'

import { supabase } from '../client'

export async function signInWithPhone(phone: string) {
  const { data, error } = await supabase.auth.signInWithOtp({
    phone,
    options: { shouldCreateUser: true },
  })
  if (error) throw error
  return data
}

export async function verifyOtp(phone: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: 'sms',
  })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function updateProfile(userId: string, updates: Partial<{
  full_name: string
  email: string
  avatar_url: string
  is_onboarding_completed: boolean
  preferred_language: string
}>) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .single()
  if (error) throw error
  return data
}
