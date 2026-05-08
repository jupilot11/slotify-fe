'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import { setPasswordSchema, type SetPasswordFormData } from '@/features/auth/validation/setPassword.schema'
import { useSetPassword } from '@/features/auth/hooks/useSetPassword'
import EyeIcon from '@/components/ui/EyeIcon'

const PASSWORD_CHECKS = [
  { label: '8+ characters', test: (v: string) => v.length >= 8 },
  { label: 'Uppercase', test: (v: string) => /[A-Z]/.test(v) },
  { label: 'Lowercase', test: (v: string) => /[a-z]/.test(v) },
  { label: 'Number', test: (v: string) => /[0-9]/.test(v) },
  { label: 'Special char', test: (v: string) => /[^A-Za-z0-9]/.test(v) },
]

const STRENGTH_LEVELS = [
  { label: 'Weak', barColor: 'bg-red-500', textColor: 'text-red-500', segments: 1 },
  { label: 'Fair', barColor: 'bg-orange-400', textColor: 'text-orange-500', segments: 2 },
  { label: 'Good', barColor: 'bg-indigo-500', textColor: 'text-indigo-600', segments: 3 },
  { label: 'Strong', barColor: 'bg-emerald-500', textColor: 'text-emerald-600', segments: 4 },
]

function getStrengthIndex(passed: number) {
  if (passed <= 2) return 0
  if (passed === 3) return 1
  if (passed === 4) return 2
  return 3
}

function PasswordStrength({ value }: { value: string }) {
  if (!value) return null

  const passed = PASSWORD_CHECKS.filter((c) => c.test(value)).length
  const idx = getStrengthIndex(passed)
  const { label, barColor, textColor, segments } = STRENGTH_LEVELS[idx]

  return (
    <div className="space-y-2.5 pt-2.5">
      <div className="flex items-center gap-2.5">
        <div className="flex flex-1 gap-1">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i < segments ? barColor : 'bg-slate-200'
                }`}
            />
          ))}
        </div>
        <span className={`text-xs font-semibold transition-colors duration-300 w-12 text-right ${textColor}`}>
          {label}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {PASSWORD_CHECKS.map(({ label: checkLabel, test }) => {
          const pass = test(value)
          return (
            <span
              key={checkLabel}
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-all duration-200 ${pass
                ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                : 'bg-slate-100 text-slate-400'
                }`}
            >
              {pass ? (
                <svg className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span className="h-3 w-3 flex items-center justify-center leading-none">·</span>
              )}
              {checkLabel}
            </span>
          )
        })}
      </div>
    </div>
  )
}

export default function SetPasswordPage() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email')
  const router = useRouter()

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const { status, submit } = useSetPassword()

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
    if (!email) return
    const ok = await submit(email, password)
    if (ok) setShowSuccess(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-white/90 backdrop-blur-sm shadow-xl border border-white/60 overflow-hidden">
          {/* Brand accent strip */}
          <div className="h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />

          <div className="px-8 py-10">
            {/* Header */}
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-100 shadow-sm ring-1 ring-indigo-100">
                <svg
                  className="h-7 w-7 text-indigo-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-semibold text-slate-900">Create your password</h1>
              {email && (
                <p className="mt-2 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-full px-3 py-1 inline-block ring-1 ring-indigo-100">
                  {email}
                </p>
              )}
              <p className="mt-2.5 text-sm text-slate-500">
                Choose a strong password to secure your account.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <div className="relative">
                  <Input
                    label="Password"
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
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
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
                Set password
              </Button>
            </form>
          </div>
        </div>
      </div>

      <Modal isOpen={showSuccess} onClose={() => router.push('/login')}>
        <div className="flex flex-col items-center gap-5 py-3 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-green-100 shadow-sm ring-1 ring-emerald-200">
            <svg
              className="h-8 w-8 text-emerald-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <div className="space-y-1.5">
            <h3 className="text-xl font-semibold text-slate-900">Password created!</h3>
            <p className="text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">
              Your password has been set successfully. You&apos;ll be redirected to login in a moment.
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
