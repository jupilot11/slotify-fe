import { invokeEdgeFunction } from '@/lib/supabase/invoke'
import type { BusinessSummary } from '@/types'

interface GetMyBusinessesResponse {
  success: boolean
  data: BusinessSummary[]
  error?: string
}

export async function getMyBusinesses(): Promise<BusinessSummary[]> {
  const result = await invokeEdgeFunction<GetMyBusinessesResponse>('get-my-businesses', {
    "method": "GET",
  })
  if (!result.success) throw new Error(result.error ?? 'Failed to load businesses')
  return result.data
}
