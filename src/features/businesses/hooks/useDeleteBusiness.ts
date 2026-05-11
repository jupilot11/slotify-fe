'use client'

import { useRef, useState } from 'react'
import { deleteBusiness } from '../services/deleteBusiness.service'

type Status = 'idle' | 'loading' | 'success' | 'error'

export function useDeleteBusiness() {
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)
  const guard = useRef(false)

  async function remove(id: string): Promise<boolean> {
    if (guard.current) return false
    guard.current = true
    setStatus('loading')
    setError(null)
    try {
      await deleteBusiness(id)
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

  return { status, error, remove }
}
