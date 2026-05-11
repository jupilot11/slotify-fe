'use client'

import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { registerUser } from '@/features/auth/services/registration.service'
import { mapAuthError } from '@/utils/errors'
import type { AuthError, RegistrationStatus } from '@/types/auth'
import type { RegistrationFormData } from '@/features/auth/validation/registration.schema'

export interface UseRegistrationReturn {
  status: RegistrationStatus
  error: AuthError | null
  submit: (data: RegistrationFormData) => Promise<void>
  reset: () => void
}

export function useRegistration(): UseRegistrationReturn {
  const [status, setStatus] = useState<RegistrationStatus>('idle')
  const [error, setError] = useState<AuthError | null>(null)

  // Ref-based guard prevents double-submission from fast clicks or StrictMode double-invoke.
  const isInflightRef = useRef(false)

  const submit = async (formData: RegistrationFormData) => {
    if (isInflightRef.current) return
    isInflightRef.current = true

    setStatus('loading')
    setError(null)

    try {
      await registerUser({
        email: formData.email.trim().toLowerCase(),
        full_name: formData.fullName.trim(),
        contact_number: formData.contactNumber.trim(),
        site_url: typeof window !== 'undefined' ? window.location.origin : '',
      })

      setStatus('success')
    } catch (err) {
      const mapped = mapAuthError(err)
      setError(mapped)
      setStatus('error')
      toast.error('Registration failed', { description: mapped.message })
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
