import type { Business } from '@/types'

export async function getAllBusinesses(): Promise<{ data: Business[] }> {
  return { data: [] }
}
