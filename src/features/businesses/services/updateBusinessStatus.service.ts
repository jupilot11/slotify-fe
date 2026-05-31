import { adminFetch } from '@/lib/supabase/adminFetch'

interface UpdateStatusResponse {
  success: boolean
  data: { id: string; status: string }
  error?: string
}

export async function updateBusinessStatus(
  businessId: string,
  status: 'approved' | 'rejected',
  reason?: string
): Promise<void> {
  const body: Record<string, string> = { businessId, status }
  if (reason) body.reason = reason

  const result = await adminFetch<UpdateStatusResponse>('admin-update-business-status', {
    method: 'POST',
    body,
  })

  if (!result.success) throw new Error(result.error ?? 'Failed to update status')
}
