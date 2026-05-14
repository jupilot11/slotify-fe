import { invokeEdgeFunction } from '@/lib/supabase/invoke'
import type { BusinessService } from '@/types'
import type { CreateServicePayload } from './createService.service'

export interface UpdateServicePayload extends Omit<CreateServicePayload, 'business_id'> {
  service_id: string
  business_id: string
}

interface UpdateServiceResponse {
  success: boolean
  data: BusinessService
  error?: string
}

export async function updateService(payload: UpdateServicePayload): Promise<BusinessService> {
  const result = await invokeEdgeFunction<UpdateServiceResponse>('update-service', {
    method: 'PATCH',
    body: payload,
  })
  if (!result.success) throw new Error(result.error ?? 'Failed to update service')
  return result.data
}
