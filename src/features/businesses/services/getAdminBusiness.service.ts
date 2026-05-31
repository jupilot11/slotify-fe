import { adminFetch } from '@/lib/supabase/adminFetch'
import type { AdminBusinessDetail } from '@/types'

interface AdminBusinessResponse {
  success: boolean
  data: AdminBusinessDetail
  error?: string
}

export async function getAdminBusiness(id: string): Promise<AdminBusinessDetail> {
  const result = await adminFetch<AdminBusinessResponse>('admin-get-business', {
    method: 'GET',
    query: { id },
  })

  if (!result.success) throw new Error(result.error ?? 'Failed to load business')
  return result.data
}
