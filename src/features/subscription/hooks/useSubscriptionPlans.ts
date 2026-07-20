import { useState, useEffect } from 'react'
import type { SubscriptionPlan } from '@/types'
import { getSubscriptionPlans } from '../services/getSubscriptionPlans.service'

export function useSubscriptionPlans() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getSubscriptionPlans()
      .then(setPlans)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Failed to load plans'))
      .finally(() => setIsLoading(false))
  }, [])

  return { plans, isLoading, error }
}
