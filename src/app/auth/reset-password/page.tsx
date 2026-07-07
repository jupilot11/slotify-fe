'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import PasswordStrength from '@/features/auth/components/PasswordStrength'
import EyeIcon from '@/components/ui/EyeIcon'
import { setPasswordSchema, type SetPasswordFormData } from '@/features/auth/validation/setPassword.schema'
import { useResetPassword } from '@/features/auth/hooks/useResetPassword'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [sessionChecked, setSessionChecked] = useState(false)
  const [hasSession, setHasSession] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const { status, error, submit } = useResetPassword()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data }) => {
      setHasSession(!!data.session)
      setSessionChecked(true)
    })
  }, [])

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<SetPasswordFormData>({
    resolver: zodResolver(setPasswordSchema),
    mode: 'onChange',
  })

  const passwordValue = watch('password', '')

  useEffect(() => {
    if (!showSuccess) return
    const t = setTimeout(() => router.push('/login'), 3000)
    return () => clearTimeout(t)
  }, [showSuccess, router])

  const onSubmit = async ({ password }: SetPasswordFormData) => {
    const ok = await submit(password)
    if (ok) setShowSuccess(true)
  }

  if (!sessionChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-pulse rounded-full bg-slate-200" />
      </div>
    )
  }

  if (!hasSession) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="rounded-2xl bg-white/90 backdrop-blur-sm shadow-xl border border-white/60 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />
            <div className="px-8 py-10 text-center space-y-6">
              <div className="flex justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-red-50 to-red-100 shadow-sm ring-1 ring-red-200">
                  <svg className="h-7 w-7 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
              <div className="space-y-1.5">
                <h1 className="text-lg font-semibold text-slate-800">Link expired or invalid</h1>
                <p className="text-sm text-slate-500">
                  This password reset link is no longer valid. Please request a new one.
                </p>
              </div>
              <Button variant="outline" className="w-full" size="md" onClick={() => router.replace('/login')}>
                Back to login
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-white/90 backdrop-blur-sm shadow-xl border border-white/60 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />
          <div className="px-8 py-10">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-100 shadow-sm ring-1 ring-indigo-100">
                <svg className="h-7 w-7 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
              <h1 className="text-2xl font-semibold text-slate-900">Reset your password</h1>
              <p className="mt-2.5 text-sm text-slate-500">Choose a new strong password for your account.</p>
            </div>

            {error && (
              <div className="mb-4 flex items-start gap-3 bg-red-50 border-l-4 border-red-500 px-4 py-3 rounded-r-lg">
                <p className="text-sm text-red-700">{error.message}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <div className="relative">
                  <Input
                    label="New password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className="pr-10"
                    error={errors.password?.message}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-[34px] text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
                <PasswordStrength value={passwordValue} />
              </div>

              <div className="relative">
                <Input
                  label="Confirm password"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="pr-10"
                  error={errors.confirmPassword?.message}
                  {...register('confirmPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-[34px] text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                >
                  <EyeIcon open={showConfirm} />
                </button>
              </div>

              <Button
                type="submit"
                className="w-full mt-1"
                size="lg"
                disabled={!isValid}
                isLoading={status === 'loading'}
              >
                Reset password
              </Button>
            </form>
          </div>
        </div>
      </div>

      <Modal isOpen={showSuccess} onClose={() => router.push('/login')}>
        <div className="flex flex-col items-center gap-5 py-3 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-green-100 shadow-sm ring-1 ring-emerald-200">
            <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <div className="space-y-1.5">
            <h3 className="text-xl font-semibold text-slate-900">Password reset!</h3>
            <p className="text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">
              Your password has been updated. You&apos;ll be redirected to login in a moment.
            </p>
          </div>
          <div className="w-full space-y-2">
            <Button className="w-full" size="lg" onClick={() => router.push('/login')}>
              Go to login
            </Button>
            <p className="text-xs text-slate-400">Redirecting automatically in 3 seconds…</p>
          </div>
        </div>
      </Modal>
    </div>
  )
}
