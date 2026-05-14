import { invokeEdgeFunction } from '@/lib/supabase/invoke'

interface DeleteServiceResponse {
  success: boolean
  data: null
  error?: string
}

export async function deleteService(serviceId: string, businessId: string): Promise<void> {
  const result = await invokeEdgeFunction<DeleteServiceResponse>('delete-service', {
    method: 'DELETE',
    body: { service_id: serviceId, business_id: businessId },
  })
  if (!result.success) throw new Error(result.error ?? 'Failed to delete service')
}
