'use client'

import { useRef, useState } from 'react'
import { updateBusiness, type UpdateBusinessPayload } from '../services/updateBusiness.service'

type Status = 'idle' | 'loading' | 'success' | 'error'

export function useUpdateBusiness() {
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)
  const guard = useRef(false)

  async function submit(id: string, payload: UpdateBusinessPayload): Promise<boolean> {
    if (guard.current) return false
    guard.current = true
    setStatus('loading')
    setError(null)
    try {
      await updateBusiness(id, payload)
      setStatus('success')
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setStatus('error')
      return false
    } finally {
      guard.current = false
    }
  }

  return { status, error, submit }
}
