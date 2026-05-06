'use client'

import { useEffect } from 'react'
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

  useEffect(() => {
    if (status === 'success') onSuccess?.()
  }, [status, onSuccess])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
  })

  const isLoading = status === 'loading'
  const isSuccess = status === 'success'
  const isDisabled = isLoading || isSuccess

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
      {error && (
        <div
          role="alert"
          aria-live="polite"
          className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg"
        >
          {error.message}
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
        {isSuccess ? 'Account created!' : 'Create account'}
      </Button>

      <p className="text-center text-sm text-slate-500">
        Already have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToLogin}
          disabled={isDisabled}
          className="text-indigo-600 font-medium hover:text-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Login
        </button>
      </p>
    </form>
  )
}
