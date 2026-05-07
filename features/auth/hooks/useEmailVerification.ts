'use client'

import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { verifyEmail } from '@/features/auth/services/emailVerification.service'
import { emailVerificationSchema } from '@/features/auth/validation/emailVerification.schema'
import { mapAuthError } from '@/utils/errors'
import type { AuthError, EmailVerificationStatus } from '@/types/auth'

export interface UseEmailVerificationReturn {
  status: EmailVerificationStatus
  error: AuthError | null
  passwordRequired: boolean
  submit: (email: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  reset: () => void
}

export function useEmailVerification(): UseEmailVerificationReturn {
  const [status, setStatus] = useState<EmailVerificationStatus>('idle')
  const [error, setError] = useState<AuthError | null>(null)
  const [passwordRequired, setPasswordRequired] = useState(false)

  // Ref-based guard prevents double-submission from fast clicks or StrictMode double-invoke.
  const isInflightRef = useRef(false)

  const submit = async (email: string) => {
    const parsed = emailVerificationSchema.safeParse({ email })
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
      const data = await verifyEmail({ email: parsed.data.email.trim().toLowerCase() })
      if (!data.password_set) {
        toast.error('Failed to resend', { description: data.message })
        return setStatus('error')
      }
      setPasswordRequired(true)
      setStatus('idle')
    } catch (err) {
      const mapped = mapAuthError(err)
      setError(mapped)
      setStatus('error')
      toast.error('Failed to resend', { description: mapped.message })
    } finally {
      isInflightRef.current = false
    }
  }

  const login = async (_email: string, _password: string) => {
    toast.info('Login API not yet available.')
  }

  const reset = () => {
    setStatus('idle')
    setError(null)
    setPasswordRequired(false)
  }

  return { status, error, passwordRequired, submit, login, reset }
}
