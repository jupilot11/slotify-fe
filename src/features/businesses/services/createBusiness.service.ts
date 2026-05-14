import { invokeEdgeFunction } from '@/lib/supabase/invoke'

export interface BusinessHour {
  day_of_week: number
  is_closed: boolean
  open_time: string | null
  close_time: string | null
}

export interface CreateBusinessPayload {
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
  logo_url?: string
  banner_url?: string
  image_urls?: string[]
  hours?: BusinessHour[]
}

interface CreateBusinessResponse {
  message: string
  data: { id: string; name: string; slug: string }
}

export async function createBusiness(payload: CreateBusinessPayload): Promise<CreateBusinessResponse> {
  return invokeEdgeFunction<CreateBusinessResponse>('create-business', { body: payload })
}
