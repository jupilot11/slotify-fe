'use client'

import { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import { logoutUser } from '@/features/auth/services/logout.service'

interface SessionExpiryModalProps {
  isOpen: boolean
  secondsRemaining: number
}

function formatCountdown(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function SessionExpiryModal({ isOpen, secondsRemaining }: SessionExpiryModalProps) {
  const router = useRouter()

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const handleLogoutNow = useCallback(async () => {
    await logoutUser()
    router.push('/login')
  }, [router])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" aria-modal="true" role="alertdialog">
      <div className="absolute inset-0 bg-black/50" aria-hidden="true" />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-8 text-center">
        <div className="mb-4 flex justify-center">
          <div className="rounded-full bg-amber-100 p-3">
            <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
            </svg>
          </div>
        </div>
        <h2 className="text-lg font-semibold text-slate-900 mb-2">Session Expiring</h2>
        <p className="text-sm text-slate-500 mb-3">For your security, you will be logged out in</p>
        <p className="text-4xl font-bold text-slate-900 mb-6 tabular-nums">{formatCountdown(secondsRemaining)}</p>
        <Button variant="danger" size="lg" className="w-full" onClick={handleLogoutNow}>
          Log out now
        </Button>
      </div>
    </div>
  )
}
