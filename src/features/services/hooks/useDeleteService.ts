'use client'

import { useState } from 'react'
import { deleteService } from '@/features/services/services/deleteService.service'

interface UseDeleteServiceResult {
  isDeleting: boolean
  error: string | null
  remove: (serviceId: string, businessId: string) => Promise<void>
}

export function useDeleteService(onSuccess: () => void): UseDeleteServiceResult {
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function remove(serviceId: string, businessId: string) {
    setIsDeleting(true)
    setError(null)
    try {
      await deleteService(serviceId, businessId)
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete service')
    } finally {
      setIsDeleting(false)
    }
  }

  return { isDeleting, error, remove }
}
