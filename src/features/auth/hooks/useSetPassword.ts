'use client'

import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { setPassword } from '@/features/auth/services/setPassword.service'
import { mapAuthError } from '@/utils/errors'
import type { AuthError, SetPasswordStatus } from '@/types/auth'

export interface UseSetPasswordReturn {
  status: SetPasswordStatus
  error: AuthError | null
  submit: (email: string, password: string) => Promise<boolean>
  reset: () => void
}

export function useSetPassword(): UseSetPasswordReturn {
  const [status, setStatus] = useState<SetPasswordStatus>('idle')
  const [error, setError] = useState<AuthError | null>(null)

  const isInflightRef = useRef(false)

  const submit = async (email: string, password: string): Promise<boolean> => {
    if (isInflightRef.current) return false
    isInflightRef.current = true

    setStatus('loading')
    setError(null)

    try {
      const data = await setPassword({ email, newPassword: password })
      if (!data.success) {
        const msg = data.error ?? data.message ?? 'Failed to set password'
        setError({ message: msg })
        setStatus('error')
        return false
      }
      setStatus('success')
      toast.success('Password set successfully.')
      return true
    } catch (err) {
      const mapped = mapAuthError(err)
      setError(mapped)
      setStatus('error')
      toast.error('Failed to set password', { description: mapped.message })
      return false
    } finally {
      isInflightRef.current = false
    }
  }

  const reset = () => {
    setStatus('idle')
    setError(null)
  }

  return { status, error, submit, reset }
}
