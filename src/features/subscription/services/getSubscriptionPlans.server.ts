import { createClient } from '@/lib/supabase/server'
import type { SubscriptionPlan } from '@/types'

export async function getSubscriptionPlansServer(): Promise<SubscriptionPlan[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.functions.invoke<{ data: SubscriptionPlan[] }>('get-subscription-plans')
  if (error || !data) return []
  return data.data
}
