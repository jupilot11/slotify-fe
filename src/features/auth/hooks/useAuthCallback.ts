'use client'

import { useEffect, useState } from 'react'
import { handleAuthCallback } from '../services/handleAuthCallback.service'

type CallbackStatus = 'verifying' | 'success' | 'error'

interface UseAuthCallbackReturn {
  status: CallbackStatus
  errorMessage: string | null
}

export function useAuthCallback(): UseAuthCallbackReturn {
  const [status, setStatus] = useState<CallbackStatus>('verifying')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const hash = window.location.hash.substring(1)
    const params = new URLSearchParams(hash)

    const accessToken = params.get('access_token')
    const refreshToken = params.get('refresh_token')
    const type = params.get('type')

    if (!accessToken || !refreshToken) {
      setErrorMessage('Missing authentication tokens. Please try again.')
      setStatus('error')
      return
    }

    handleAuthCallback({ accessToken, refreshToken, type }).then((result) => {
      if (result.success) {
        setStatus('success')
      } else {
        setErrorMessage(result.error ?? 'Something went wrong.')
        setStatus('error')
      }
    })
  }, [])

  return { status, errorMessage }
}
