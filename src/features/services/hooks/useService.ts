'use client'

import { useCallback, useEffect, useState } from 'react'
import { getService } from '@/features/services/services/getService.service'
import type { BusinessService } from '@/types'

type Status = 'idle' | 'loading' | 'success' | 'error'

interface UseServiceResult {
  service: BusinessService | null
  status: Status
  error: string | null
  reload: () => void
}

export function useService(serviceId: string | null): UseServiceResult {
  const [service, setService] = useState<BusinessService | null>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (!serviceId) return
    let cancelled = false
    setStatus('loading')
    setError(null)

    getService(serviceId)
      .then((data) => {
        if (!cancelled) {
          setService(data)
          setStatus('success')
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load service')
          setStatus('error')
        }
      })

    return () => {
      cancelled = true
    }
  }, [serviceId, tick])

  const reload = useCallback(() => setTick((t) => t + 1), [])

  return { service, status, error, reload }
}
