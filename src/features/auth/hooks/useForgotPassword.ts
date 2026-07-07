'use client'

import { useRef, useState } from 'react'
import { forgotPassword } from '@/features/auth/services/forgotPassword.service'
import { forgotPasswordSchema } from '@/features/auth/validation/forgotPassword.schema'
import { mapAuthError } from '@/utils/errors'
import type { AuthError, ForgotPasswordStatus } from '@/types/auth'

export interface UseForgotPasswordReturn {
  status: ForgotPasswordStatus
  error: AuthError | null
  submit: (email: string) => Promise<void>
  reset: () => void
}

export function useForgotPassword(): UseForgotPasswordReturn {
  const [status, setStatus] = useState<ForgotPasswordStatus>('idle')
  const [error, setError] = useState<AuthError | null>(null)
  const isInflightRef = useRef(false)

  const submit = async (email: string) => {
    const parsed = forgotPasswordSchema.safeParse({ email })
    if (!parsed.success) {
      setError({ message: parsed.error.issues[0].message })
      setStatus('error')
      return
    }

    if (isInflightRef.current) return
    isInflightRef.current = true

    setStatus('loading')
    setError(null)

    try {
      await forgotPassword({
        email: parsed.data.email.trim().toLowerCase(),
        site_url: window.location.origin,
      })
      setStatus('success')
    } catch (err) {
      const mapped = mapAuthError(err)
      setError(mapped)
      setStatus('error')
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
