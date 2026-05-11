'use client'

import { useRef, useState } from 'react'
import { createBusiness, type CreateBusinessPayload } from '../services/createBusiness.service'

type Status = 'idle' | 'loading' | 'success' | 'error'

export function useCreateBusiness() {
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)
  const guard = useRef(false)

  async function submit(payload: CreateBusinessPayload) {
    if (guard.current) return undefined
    guard.current = true
    setStatus('loading')
    setError(null)
    try {
      const result = await createBusiness(payload)
      setStatus('success')
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setStatus('error')
      return undefined
    } finally {
      guard.current = false
    }
  }

  function reset() {
    setStatus('idle')
    setError(null)
  }

  return { status, error, submit, reset }
}
