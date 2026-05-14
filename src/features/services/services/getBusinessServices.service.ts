import { invokeEdgeFunction } from '@/lib/supabase/invoke'
import type { BusinessService } from '@/types'

interface GetBusinessServicesResponse {
  success: boolean
  data: BusinessService[]
  error?: string
}

export async function getBusinessServices(businessId: string): Promise<BusinessService[]> {
  const result = await invokeEdgeFunction<GetBusinessServicesResponse>(
    `get-business-services?business_id=${encodeURIComponent(businessId)}`,
    { method: 'GET' }
  )
  if (!result.success) throw new Error(result.error ?? 'Failed to load services')
  return result.data
}
