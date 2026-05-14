'use client'

import { useCallback, useEffect, useState } from 'react'
import { getBusinessServices } from '@/features/services/services/getBusinessServices.service'
import type { BusinessService } from '@/types'

type Status = 'idle' | 'loading' | 'success' | 'error'

interface UseBusinessServicesResult {
  services: BusinessService[]
  status: Status
  error: string | null
  reload: () => void
}

export function useBusinessServices(businessId: string | null): UseBusinessServicesResult {
  const [services, setServices] = useState<BusinessService[]>([])
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (!businessId) return
    let cancelled = false
    setStatus('loading')
    setError(null)

    getBusinessServices(businessId)
      .then((data) => {
        if (!cancelled) {
          setServices(data)
          setStatus('success')
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load services')
          setStatus('error')
        }
      })

    return () => {
      cancelled = true
    }
  }, [businessId, tick])

  const reload = useCallback(() => setTick((t) => t + 1), [])

  return { services, status, error, reload }
}
