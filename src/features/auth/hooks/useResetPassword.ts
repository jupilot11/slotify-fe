'use client'

import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { mapAuthError } from '@/utils/errors'
import type { AuthError, ResetPasswordStatus } from '@/types/auth'

export interface UseResetPasswordReturn {
  status: ResetPasswordStatus
  error: AuthError | null
  submit: (password: string) => Promise<boolean>
}

export function useResetPassword(): UseResetPasswordReturn {
  const [status, setStatus] = useState<ResetPasswordStatus>('idle')
  const [error, setError] = useState<AuthError | null>(null)
  const isInflightRef = useRef(false)

  const submit = async (password: string): Promise<boolean> => {
    if (isInflightRef.current) return false
    isInflightRef.current = true

    setStatus('loading')
    setError(null)

    try {
      const supabase = createClient()
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) throw updateError
      await supabase.auth.signOut()
      setStatus('success')
      return true
    } catch (err) {
      const mapped = mapAuthError(err)
      setError(mapped)
      setStatus('error')
      return false
    } finally {
      isInflightRef.current = false
    }
  }

  return { status, error, submit }
}
