import type { Service, ApiResponse, PaginatedResponse } from '@/types'
import { mockServices } from '@/mock/services'

let servicesStore = [...mockServices]

const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms))

export async function getServicesByBusiness(
  businessId: string
): Promise<PaginatedResponse<Service>> {
  await delay()
  const results = servicesStore.filter((s) => s.businessId === businessId)
  return { data: results, total: results.length, page: 1, limit: 50 }
}

export async function getServiceById(id: string): Promise<ApiResponse<Service>> {
  await delay()
  const service = servicesStore.find((s) => s.id === id)
  return { data: service ?? null, error: service ? null : 'Service not found' }
}

export async function createService(data: Omit<Service, 'id'>): Promise<ApiResponse<Service>> {
  await delay()
  const service: Service = { ...data, id: `svc_${Date.now()}` }
  servicesStore.push(service)
  return { data: service, error: null }
}

export async function updateService(
  id: string,
  updates: Partial<Service>
): Promise<ApiResponse<Service>> {
  await delay()
  const index = servicesStore.findIndex((s) => s.id === id)
  if (index === -1) return { data: null, error: 'Service not found' }
  servicesStore[index] = { ...servicesStore[index], ...updates }
  return { data: servicesStore[index], error: null }
}

export async function deleteService(id: string): Promise<ApiResponse<null>> {
  await delay()
  const index = servicesStore.findIndex((s) => s.id === id)
  if (index === -1) return { data: null, error: 'Service not found' }
  servicesStore.splice(index, 1)
  return { data: null, error: null }
}
