'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { verifyEmail } from '@/features/auth/services/emailVerification.service'
import { loginUser } from '@/features/auth/services/login.service'
import { emailVerificationSchema } from '@/features/auth/validation/emailVerification.schema'
import { mapAuthError } from '@/utils/errors'
import type { AuthError, EmailVerificationStatus } from '@/types/auth'

export interface UseEmailVerificationReturn {
  status: EmailVerificationStatus
  error: AuthError | null
  passwordRequired: boolean
  showPasswordSetupDialog: boolean
  pendingEmail: string | null
  dismissPasswordSetupDialog: () => void
  submit: (email: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  reset: () => void
}

export function useEmailVerification(): UseEmailVerificationReturn {
  const router = useRouter()
  const [status, setStatus] = useState<EmailVerificationStatus>('idle')
  const [error, setError] = useState<AuthError | null>(null)
  const [passwordRequired, setPasswordRequired] = useState(false)
  const [showPasswordSetupDialog, setShowPasswordSetupDialog] = useState(false)
  const [pendingEmail, setPendingEmail] = useState<string | null>(null)

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
      if (!data.email_verified) {
        setError({ message: data.message ?? 'Failed to resend verification email' })
        return setStatus('error')
      }
      if (!data.password_set) {
        setStatus('idle')
        setPendingEmail(parsed.data.email.trim().toLowerCase())
        setShowPasswordSetupDialog(true)
        return
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

  const login = async (email: string, password: string) => {
    if (isInflightRef.current) return
    isInflightRef.current = true

    setStatus('loading')
    setError(null)

    try {
      const response = await loginUser({ email, password })
      const userProfile = response.profile;
      if (userProfile != null) {
        if (userProfile.roles.includes('admin')) {
          toast.success('Login successful! Redirecting to admin dashboard...')
          reset()
          return
        }
        if (userProfile.roles.includes('customer')) {
          router.push('/dashboard')
          reset()
          return
        }
      }
      setError({ message: 'Login successful, but failed to retrieve user profile' })
      setStatus('error')
    } catch (err) {
      const mapped = mapAuthError(err)
      setError(mapped)
      setStatus('error')
    } finally {
      isInflightRef.current = false
    }
  }

  const dismissPasswordSetupDialog = () => setShowPasswordSetupDialog(false)

  const reset = () => {
    setStatus('idle')
    setError(null)
    setPasswordRequired(false)
    setShowPasswordSetupDialog(false)
    setPendingEmail(null)
  }

  return { status, error, passwordRequired, showPasswordSetupDialog, pendingEmail, dismissPasswordSetupDialog, submit, login, reset }
}
