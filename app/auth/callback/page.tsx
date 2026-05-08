'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { markEmailVerified } from '@/features/auth/services/emailVerificationCallback.service'
import Button from '@/components/ui/Button'

type Status = 'verifying' | 'success' | 'error'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [status, setStatus] = useState<Status>('verifying')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
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

      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      })

      if (sessionError) {
        setErrorMessage('Invalid or expired verification link. Please request a new one.')
        setStatus('error')
        return
      }

      if (type === 'signup') {
        try {
          await markEmailVerified(accessToken)
        } catch {
          // Non-fatal: session is established; profile update can be retried
        }
      }

      await supabase.auth.signOut()
      setStatus('success')
    }

    handleCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl bg-white/90 backdrop-blur-sm shadow-xl border border-white/60 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />
          <div className="px-8 py-10 text-center space-y-6">
            {status === 'verifying' && <VerifyingState />}
            {status === 'success' && <SuccessState onLogin={() => router.replace('/login')} />}
            {status === 'error' && (
              <ErrorState
                message={errorMessage ?? 'Something went wrong.'}
                onBack={() => router.replace('/login')}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function VerifyingState() {
  return (
    <>
      <div className="flex justify-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-100 shadow-sm ring-1 ring-indigo-100">
          <svg
            className="animate-spin h-7 w-7 text-indigo-600"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-20"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              className="opacity-90"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        </div>
      </div>
      <div className="space-y-1.5">
        <h1 className="text-lg font-semibold text-slate-800">Verifying your email</h1>
        <p className="text-sm text-slate-500">This will only take a moment…</p>
      </div>
    </>
  )
}

function SuccessState({ onLogin }: { onLogin: () => void }) {
  return (
    <>
      <div className="flex justify-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-green-100 shadow-sm ring-1 ring-emerald-200">
          <svg
            className="h-7 w-7 text-emerald-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>
      <div className="space-y-1.5">
        <h1 className="text-lg font-semibold text-slate-800">Email verified!</h1>
        <p className="text-sm text-slate-500">
          Your email has been successfully verified. You can now log in to your account.
        </p>
      </div>
      <Button className="w-full" size="md" onClick={onLogin}>
        Continue to login
      </Button>
    </>
  )
}

function ErrorState({ message, onBack }: { message: string; onBack: () => void }) {
  return (
    <>
      <div className="flex justify-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-red-50 to-red-100 shadow-sm ring-1 ring-red-200">
          <svg
            className="h-7 w-7 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      </div>
      <div className="space-y-1.5">
        <h1 className="text-lg font-semibold text-slate-800">Verification failed</h1>
        <p className="text-sm text-slate-500">{message}</p>
      </div>
      <Button variant="outline" className="w-full" size="md" onClick={onBack}>
        Back to login
      </Button>
    </>
  )
}
