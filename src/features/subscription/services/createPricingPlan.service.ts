import { adminFetch } from '@/lib/supabase/adminFetch'
import type { SubscriptionPlan } from '@/types'

type PlanFormData = Omit<SubscriptionPlan, 'id' | 'created_at'>

interface CreatePlanResponse {
  success: boolean
  data: SubscriptionPlan
  error?: string
}

export async function createPricingPlan(data: PlanFormData): Promise<SubscriptionPlan> {
  const result = await adminFetch<CreatePlanResponse>('admin-create-subscription-plan', {
    method: 'POST',
    body: data,
  })
  if (!result.success) throw new Error(result.error ?? 'Failed to create plan')
  return result.data
}
