import { invokeEdgeFunction } from '@/lib/supabase/invoke'
import type { BusinessHour } from './createBusiness.service'

export interface UpdateBusinessPayload {
  name: string
  category_id?: string
  description?: string
  email?: string
  phone?: string
  website_url?: string
  address?: string
  city?: string
  province?: string
  postal_code?: string
  lat?: number
  lng?: number
  logo_url?: string
  banner_url?: string
  image_urls?: string[]
  hours?: BusinessHour[]
}

interface UpdateBusinessResponse {
  success: boolean
  data: Record<string, unknown>
}

export async function updateBusiness(id: string, payload: UpdateBusinessPayload): Promise<void> {
  const result = await invokeEdgeFunction<UpdateBusinessResponse>(`manage-business/${id}`, {
    method: 'PATCH',
    body: payload,
  })
  if (!result.success) throw new Error('Failed to update business')
}
