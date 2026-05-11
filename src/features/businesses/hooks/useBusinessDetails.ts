import { useState, useEffect, useCallback } from 'react'
import { getBusinessBySlug, type BusinessDetail } from '../services/getBusinessBySlug.service'

interface State {
  data: BusinessDetail | null
  loading: boolean
  error: string | null
  reload: () => void
}

export function useBusinessDetails(slug: string): State {
  const [state, setState] = useState<Omit<State, 'reload'>>({ data: null, loading: true, error: null })
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    setState({ data: null, loading: true, error: null })

    getBusinessBySlug(slug)
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null })
      })
      .catch((err) => {
        if (!cancelled)
          setState({ data: null, loading: false, error: err instanceof Error ? err.message : 'Failed to load business' })
      })

    return () => { cancelled = true }
  }, [slug, tick])

  const reload = useCallback(() => setTick((t) => t + 1), [])

  return { ...state, reload }
}
