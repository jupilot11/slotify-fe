import { invokeEdgeFunction } from '@/lib/supabase/invoke'
import type { DayHours } from '@/features/businesses/components/BusinessHoursEditor'

export interface BusinessDetail {
  id: string
  name: string
  slug: string
  category_id: string | null
  description: string | null
  email: string | null
  phone: string | null
  website_url: string | null
  address: string | null
  city: string | null
  province: string | null
  postal_code: string | null
  logo_url: string | null
  banner_url: string | null
  image_urls: string[]
  hours: DayHours[]
}

interface GetBusinessBySlugResponse {
  success: boolean
  data: BusinessDetail
  error?: string
}

export async function getBusinessBySlug(slug: string): Promise<BusinessDetail> {
  const result = await invokeEdgeFunction<GetBusinessBySlugResponse>('get-business-by-slug', {
    method: 'GET',
    headers: { 'x-slug': slug },
  })
  if (!result.success) throw new Error(result.error ?? 'Failed to load business')
  return result.data
}
