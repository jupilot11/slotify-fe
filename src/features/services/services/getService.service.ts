import { invokeEdgeFunction } from '@/lib/supabase/invoke'
import type { BusinessService } from '@/types'

interface GetServiceResponse {
  success: boolean
  data: BusinessService
  error?: string
}

export async function getService(serviceId: string): Promise<BusinessService> {
  const result = await invokeEdgeFunction<GetServiceResponse>(
    `get-service?service_id=${encodeURIComponent(serviceId)}`,
    { method: 'GET' }
  )
  if (!result.success) throw new Error(result.error ?? 'Failed to load service')
  return result.data
}
