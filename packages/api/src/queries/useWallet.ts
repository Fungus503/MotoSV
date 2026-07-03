import { useQuery } from '@tanstack/react-query'
import { supabase } from '../client'

export function useWallet(userId: string | undefined) {
  return useQuery({
    queryKey: ['wallet', userId],
    queryFn: async () => {
      if (!userId) return null
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', userId)
        .single()
      if (error && error.code !== 'PGRST116') throw error
      return data
    },
    enabled: !!userId,
  })
}

export function useWalletTransactions(userId: string | undefined) {
  return useQuery({
    queryKey: ['wallet-transactions', userId],
    queryFn: async () => {
      if (!userId) return []
      const { data: wallet } = await supabase
        .from('wallets')
        .select('id')
        .eq('user_id', userId)
        .single()
      if (!wallet) return []
      const { data, error } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('wallet_id', wallet.id)
        .order('created_at', { ascending: false })
        .limit(50)
      if (error) throw error
      return data ?? []
    },
    enabled: !!userId,
  })
}

export function useReferralCode(userId: string | undefined) {
  return useQuery({
    queryKey: ['referral-code', userId],
    queryFn: async () => {
      if (!userId) return null
      const { data, error } = await supabase
        .from('referral_codes')
        .select('*')
        .eq('user_id', userId)
        .single()
      if (error && error.code !== 'PGRST116') throw error
      return data
    },
    enabled: !!userId,
  })
}

export function useReferrals(userId: string | undefined) {
  return useQuery({
    queryKey: ['referrals', userId],
    queryFn: async () => {
      if (!userId) return []
      const { data, error } = await supabase
        .from('referrals')
        .select('*, referred:referred_id(full_name, phone)')
        .eq('referrer_id', userId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data ?? []
    },
    enabled: !!userId,
  })
}

export function useActivePromotions() {
  return useQuery({
    queryKey: ['promotions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .eq('is_active', true)
        .lte('starts_at', new Date().toISOString())
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
      if (error) throw error
      return data ?? []
    },
  })
}
