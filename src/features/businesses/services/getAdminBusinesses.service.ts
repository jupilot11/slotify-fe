import { adminFetch } from '@/lib/supabase/adminFetch'
import type { AdminBusiness, AdminBusinessStatus } from '@/types'

interface AdminBusinessesResponse {
  success: boolean
  data: AdminBusiness[]
  total_filtered: number
  page: number
  limit: number
  error?: string
}

export interface AdminBusinessesResult {
  businesses: AdminBusiness[]
  totalFiltered: number
}

export interface GetAdminBusinessesParams {
  search?: string
  status?: AdminBusinessStatus | ''
  page?: number
  limit?: number
}

export async function getAdminBusinesses(params: GetAdminBusinessesParams = {}): Promise<AdminBusinessesResult> {
  const query: Record<string, string> = {}
  if (params.search) query.search = params.search
  if (params.status) query.status = params.status
  if (params.page) query.page = String(params.page)
  if (params.limit) query.limit = String(params.limit)

  const result = await adminFetch<AdminBusinessesResponse>('admin-get-businesses', { method: 'GET', query })

  if (!result.success) throw new Error(result.error ?? 'Failed to load businesses')

  return {
    businesses: result.data,
    totalFiltered: result.total_filtered,
  }
}
