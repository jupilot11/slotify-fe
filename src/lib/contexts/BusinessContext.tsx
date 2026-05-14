'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { getMyBusinesses } from '@/features/businesses/services/getMyBusinesses.service'
import type { BusinessSummary } from '@/types'

type Status = 'idle' | 'loading' | 'success' | 'error'

interface BusinessContextValue {
  businesses: BusinessSummary[]
  selectedBusiness: BusinessSummary | null
  status: Status
  error: string | null
  setSelectedBusiness: (business: BusinessSummary | null) => void
  reload: () => void
}

const BusinessContext = createContext<BusinessContextValue | null>(null)

export function BusinessProvider({ children }: { children: ReactNode }) {
  const [businesses, setBusinesses] = useState<BusinessSummary[]>([])
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessSummary | null>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    setStatus('loading')
    setError(null)

    getMyBusinesses()
      .then((data) => {
        if (!cancelled) {
          setBusinesses(data)
          setStatus('success')
          // Keep selection if it still exists, otherwise fall back to first
          setSelectedBusiness((prev) => {
            if (prev === null) return data[0] ?? null
            return data.find((b) => b.id === prev.id) ?? data[0] ?? null
          })
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load businesses')
          setStatus('error')
        }
      })

    return () => {
      cancelled = true
    }
  }, [tick])

  const reload = useCallback(() => setTick((t) => t + 1), [])

  return (
    <BusinessContext.Provider
      value={{ businesses, selectedBusiness, status, error, setSelectedBusiness, reload }}
    >
      {children}
    </BusinessContext.Provider>
  )
}

export function useBusinessContext(): BusinessContextValue {
  const ctx = useContext(BusinessContext)
  if (!ctx) throw new Error('useBusinessContext must be used within BusinessProvider')
  return ctx
}
