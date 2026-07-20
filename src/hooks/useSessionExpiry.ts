'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { logoutUser } from '@/features/auth/services/logout.service'

const SESSION_DURATION_MS = 86_400_000
const WARNING_BEFORE_MS = 300_000 // 5 minutes

function readSessionStart(): number | null {
  const entry = document.cookie
    .split('; ')
    .find((row) => row.startsWith('slotify_session_start='))
  if (!entry) return null
  const val = parseInt(entry.split('=')[1], 10)
  return isNaN(val) ? null : val
}

interface UseSessionExpiryReturn {
  showWarning: boolean
  secondsRemaining: number
}

export function useSessionExpiry(): UseSessionExpiryReturn {
  const router = useRouter()
  const [showWarning, setShowWarning] = useState(false)
  const [secondsRemaining, setSecondsRemaining] = useState(300)
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startCountdown = useCallback((initialSeconds: number) => {
    setSecondsRemaining(initialSeconds)
    setShowWarning(true)
    countdownRef.current = setInterval(() => {
      setSecondsRemaining((s) => {
        if (s <= 1) {
          clearInterval(countdownRef.current!)
          return 0
        }
        return s - 1
      })
    }, 1000)
  }, [])

  const handleExpiry = useCallback(async () => {
    if (countdownRef.current) clearInterval(countdownRef.current)
    await logoutUser()
    router.push('/login?expired=true')
  }, [router])

  useEffect(() => {
    const sessionStart = readSessionStart()
    if (!sessionStart) return

    const elapsed = Date.now() - sessionStart
    const timeRemaining = SESSION_DURATION_MS - elapsed

    if (timeRemaining <= 0) {
      handleExpiry()
      return
    }

    const warningDelay = timeRemaining - WARNING_BEFORE_MS
    const expiryTimeout = setTimeout(handleExpiry, timeRemaining)
    const warningTimeout = setTimeout(
      () => startCountdown(warningDelay <= 0 ? Math.ceil(timeRemaining / 1000) : 300),
      warningDelay <= 0 ? 0 : warningDelay,
    )

    return () => {
      clearTimeout(warningTimeout)
      clearTimeout(expiryTimeout)
      if (countdownRef.current) clearInterval(countdownRef.current)
    }
  }, [handleExpiry, startCountdown])

  return { showWarning, secondsRemaining }
}
