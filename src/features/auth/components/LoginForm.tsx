'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { useEmailVerification } from '@/features/auth/hooks/useEmailVerification'
import PasswordSetupDialog from '@/features/auth/components/PasswordSetupDialog'
import EyeIcon from '@/components/ui/EyeIcon'
import { resendVerificationLink } from '@/features/auth/services/resendVerificationLink.service'
import ForgotPasswordDialog from '@/features/auth/components/ForgotPasswordDialog'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().optional(),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginForm() {
  const { status, error, passwordRequired, showPasswordSetupDialog, pendingEmail, dismissPasswordSetupDialog, submit, login, reset } = useEmailVerification()
  const [displayError, setDisplayError] = useState<typeof error>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [resendStatus, setResendStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [showForgotPassword, setShowForgotPassword] = useState(false)

  useEffect(() => {
    setDisplayError(error)
    setResendStatus('idle')
  }, [error])

  const {
    register,
    handleSubmit,
    watch,
    setError: setFieldError,
    setFocus,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const emailValue = watch('email', '')
  const passwordValue = watch('password', '')
  const isEmailValid = loginSchema.shape.email.safeParse(emailValue).success

  useEffect(() => {
    const { unsubscribe } = watch(() => setDisplayError(null))
    return unsubscribe
  }, [watch])

  useEffect(() => {
    if (passwordRequired) setFocus('password')
  }, [passwordRequired, setFocus])

  const handleResend = async () => {
    if (!emailValue || resendStatus === 'loading' || resendStatus === 'success') return
    setResendStatus('loading')
    try {
      await resendVerificationLink({ email: emailValue, site_url: window.location.origin })
      setResendStatus('success')
      toast.success('Verification email sent! Please check your inbox.')
    } catch (err) {
      setResendStatus('error')
      toast.error(err instanceof Error ? err.message : 'Failed to resend verification email')
    }
  }

  const onSubmit = async (data: LoginFormData) => {
    if (passwordRequired) {
      if (!data.password) {
        setFieldError('password', { message: 'Password is required' })
        return
      }
      await login(data.email, data.password)
    } else {
      await submit(data.email)
    }
  }

  return (
    <>
      <PasswordSetupDialog isOpen={showPasswordSetupDialog} onClose={dismissPasswordSetupDialog} email={pendingEmail} />
      <ForgotPasswordDialog isOpen={showForgotPassword} onClose={() => setShowForgotPassword(false)} />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {displayError && (
          <div className="flex items-start gap-3 rounded-xl bg-red-50 border border-red-100 px-4 py-3.5">
            <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
              <svg
                className="w-3 h-3 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                />
              </svg>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm text-red-700 leading-relaxed">{displayError.message}</p>
              {displayError.code === 'EMAIL_NOT_VERIFIED' && (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendStatus === 'loading' || resendStatus === 'success'}
                  className="text-sm text-red-600 underline hover:text-red-800 font-medium text-left disabled:opacity-60 disabled:cursor-not-allowed transition-opacity"
                >
                  {resendStatus === 'loading'
                    ? 'Sending…'
                    : resendStatus === 'success'
                      ? 'Verification email sent!'
                      : 'Resend verification link'}
                </button>
              )}
            </div>
          </div>
        )}

        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          error={errors.email?.message}
          className="shadow-sm"
          {...register('email', {
            onChange: () => {
              if (passwordRequired) {
                reset()
                setValue('password', '')
              }
            },
          })}
        />

        <div
          className={[
            'transition-all duration-300 ease-out',
            passwordRequired
              ? 'max-h-32 opacity-100 translate-y-0 overflow-visible'
              : 'max-h-0 opacity-0 -translate-y-2 overflow-hidden',
          ].join(' ')}
        >
          <div className='relative'>
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="current-password"
              error={errors.password?.message}
              className="shadow-sm"
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
        </div>

        <div
          className={[
            'overflow-hidden transition-all duration-300 ease-out',
            passwordRequired
              ? 'max-h-16 opacity-100 translate-y-0'
              : 'max-h-0 opacity-0 -translate-y-2',
          ].join(' ')}
        >
          <div className="flex items-center justify-between pt-0.5">
            <label className="flex items-center gap-2.5 text-sm text-slate-500 cursor-pointer select-none group">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer"
              />
              <span className="group-hover:text-slate-700 transition-colors">Remember me</span>
            </label>
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
            >
              Forgot password?
            </button>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-md shadow-indigo-500/20 transition-all duration-200 font-semibold"
          size="lg"
          isLoading={status === 'loading'}
          disabled={passwordRequired ? !passwordValue : !isEmailValid}
        >
          {passwordRequired ? 'Sign in' : 'Continue'}
        </Button>
      </form>
    </>
  )
}
