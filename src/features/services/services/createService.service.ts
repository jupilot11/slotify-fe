import { invokeEdgeFunction } from '@/lib/supabase/invoke'
import type { BusinessService } from '@/types'

export interface CreateServicePayload {
  business_id: string
  name: string
  slug: string
  description?: string | null
  image_url?: string | null
  service_type: 'appointment' | 'time_slot'
  min_duration_minutes: number
  max_duration_minutes?: number | null
  duration_note?: string | null
  buffer_time_minutes?: number
  pricing_type: 'fixed' | 'range' | 'on_request'
  price_amount?: number | null
  price_min?: number | null
  price_max?: number | null
  price_note?: string | null
  currency?: string
  max_capacity?: number
  requires_confirmation: boolean
  is_active: boolean
}

interface CreateServiceResponse {
  success: boolean
  data: BusinessService
  error?: string
}

export async function createService(payload: CreateServicePayload): Promise<BusinessService> {
  const result = await invokeEdgeFunction<CreateServiceResponse>('create-service', {
    body: payload,
  })
  if (!result.success) throw new Error(result.error ?? 'Failed to create service')
  return result.data
}
