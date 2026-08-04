import { adminFetch } from '@/lib/supabase/adminFetch'

interface DeletePlanResponse {
  success: boolean
  error?: string
}

export async function deletePricingPlan(id: string): Promise<void> {
  const result = await adminFetch<DeletePlanResponse>('admin-delete-subscription-plan', {
    method: 'POST',
    body: { id },
  })
  if (!result.success) throw new Error(result.error ?? 'Failed to delete plan')
}
