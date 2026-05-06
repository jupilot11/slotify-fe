import type { Business, ApiResponse, PaginatedResponse } from '@/types'
import { mockBusinesses } from '@/mock/businesses'

let businessStore = [...mockBusinesses]

const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms))

export async function getBusinessBySlug(slug: string): Promise<ApiResponse<Business>> {
  await delay()
  const business = businessStore.find((b) => b.slug === slug && b.isActive)
  return { data: business ?? null, error: business ? null : 'Business not found' }
}

export async function getBusinessById(id: string): Promise<ApiResponse<Business>> {
  await delay()
  const business = businessStore.find((b) => b.id === id)
  return { data: business ?? null, error: business ? null : 'Business not found' }
}

export async function getAllBusinesses(): Promise<PaginatedResponse<Business>> {
  await delay()
  return { data: businessStore, total: businessStore.length, page: 1, limit: 50 }
}

export async function updateBusiness(
  id: string,
  updates: Partial<Business>
): Promise<ApiResponse<Business>> {
  await delay()
  const index = businessStore.findIndex((b) => b.id === id)
  if (index === -1) return { data: null, error: 'Business not found' }
  businessStore[index] = { ...businessStore[index], ...updates }
  return { data: businessStore[index], error: null }
}
