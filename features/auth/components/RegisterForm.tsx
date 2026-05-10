'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { registrationSchema, type RegistrationFormData } from '@/features/auth/validation/registration.schema'
import { useRegistration } from '@/features/auth/hooks/useRegistration'

interface RegisterFormProps {
  onSwitchToLogin: () => void
  onSuccess?: () => void
}

export default function RegisterForm({ onSwitchToLogin, onSuccess }: RegisterFormProps) {
  const { status, error, submit } = useRegistration()
  const [displayError, setDisplayError] = useState<typeof error>(null)

  useEffect(() => {
    if (status === 'success') onSuccess?.()
  }, [status, onSuccess])

  useEffect(() => {
    setDisplayError(error)
  }, [error])

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
  })

  useEffect(() => {
    const { unsubscribe } = watch(() => setDisplayError(null))
    return unsubscribe
  }, [watch])

  const isLoading = status === 'loading'
  const isSuccess = status === 'success'
  const isDisabled = isLoading || isSuccess

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-5" noValidate>
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
        label="Full name"
        type="text"
        placeholder="Juan Dela Cruz"
        autoComplete="name"
        disabled={isDisabled}
        error={errors.fullName?.message}
        {...register('fullName')}
      />
      <Input
        label="Mobile number"
        type="tel"
        placeholder="09xxxxxxxxx"
        autoComplete="tel"
        disabled={isDisabled}
        error={errors.contactNumber?.message}
        {...register('contactNumber')}
      />
      <Input
        label="Email"
        type="email"
        placeholder="you@email.com"
        autoComplete="email"
        disabled={isDisabled}
        error={errors.email?.message}
        {...register('email')}
      />

      <Button
        type="submit"
        className="w-full"
        size="lg"
        isLoading={isLoading}
        disabled={isDisabled}
      >
        {isSuccess ? (
          <span className="flex items-center gap-2">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            Account created!
          </span>
        ) : (
          'Create account'
        )}
      </Button>

      <p className="text-center text-sm text-slate-500">
        Already have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToLogin}
          disabled={isDisabled}
          className="text-indigo-600 font-medium hover:text-indigo-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Sign in
        </button>
      </p>
    </form>
  )
}
