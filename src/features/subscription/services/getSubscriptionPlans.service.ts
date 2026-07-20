import { invokeEdgeFunction } from '@/lib/supabase/invoke'
import type { SubscriptionPlan } from '@/types'

export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const { data } = await invokeEdgeFunction<{ data: SubscriptionPlan[] }>('get-subscription-plans')
  return data
}
