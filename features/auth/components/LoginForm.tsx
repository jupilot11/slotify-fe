'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { useEmailVerification } from '@/features/auth/hooks/useEmailVerification'
import PasswordSetupDialog from '@/features/auth/components/PasswordSetupDialog'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().optional(),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginForm() {
  const { status, error, passwordRequired, showPasswordSetupDialog, pendingEmail, dismissPasswordSetupDialog, submit, login, reset } = useEmailVerification()
  const [displayError, setDisplayError] = useState<typeof error>(null)

  useEffect(() => {
    setDisplayError(error)
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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {displayError && (
          <div className="flex items-start gap-3 bg-red-50 border-l-4 border-red-500 px-4 py-3 rounded-r-lg">
            <svg
              className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
            <p className="text-sm text-red-700 leading-relaxed">{displayError.message}</p>
          </div>
        )}

        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          error={errors.email?.message}
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
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password')}
          />
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
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
            >
              Forgot password?
            </button>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
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
