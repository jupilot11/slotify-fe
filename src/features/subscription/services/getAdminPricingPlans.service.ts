import { adminFetch } from '@/lib/supabase/adminFetch'
import type { SubscriptionPlan } from '@/types'

interface GetPlansResponse {
  success: boolean
  data: SubscriptionPlan[]
  error?: string
}

export async function getAdminPricingPlans(): Promise<SubscriptionPlan[]> {
  const result = await adminFetch<GetPlansResponse>('admin-get-subscription-plans')
  if (!result.success) throw new Error(result.error ?? 'Failed to load plans')
  return result.data
}
