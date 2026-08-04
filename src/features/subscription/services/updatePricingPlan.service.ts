import { adminFetch } from '@/lib/supabase/adminFetch'
import type { SubscriptionPlan } from '@/types'

type PlanFormData = Omit<SubscriptionPlan, 'id' | 'created_at'>

interface UpdatePlanResponse {
  success: boolean
  data: SubscriptionPlan
  error?: string
}

export async function updatePricingPlan(data: PlanFormData & { id: string }): Promise<SubscriptionPlan> {
  const result = await adminFetch<UpdatePlanResponse>('admin-update-subscription-plan', {
    method: 'POST',
    body: data,
  })
  if (!result.success) throw new Error(result.error ?? 'Failed to update plan')
  return result.data
}
