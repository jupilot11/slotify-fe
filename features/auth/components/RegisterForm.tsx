'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

const registerSchema = z.object({
  fullName: z.string().min(2, 'Please enter your full name'),
  mobileNumber: z
    .string()
    .min(10, 'Please enter a valid mobile number')
    .regex(/^[0-9+\-\s]+$/, 'Please enter a valid mobile number'),
  email: z.string().email('Please enter a valid email'),
})

type RegisterFormData = z.infer<typeof registerSchema>

interface RegisterFormProps {
  onSwitchToLogin: () => void
}

export default function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null)
    try {
      const { signUp } = await import('@/services/auth.service')
      const result = await signUp(data)
      if (result.error) {
        setServerError(result.error)
        return
      }
      window.location.href = '/dashboard'
    } catch {
      setServerError('Something went wrong. Please try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
          {serverError}
        </div>
      )}
      <Input
        label="Full name"
        type="text"
        placeholder="Juan Dela Cruz"
        autoComplete="name"
        error={errors.fullName?.message}
        {...register('fullName')}
      />
      <Input
        label="Mobile Number"
        type="tel"
        placeholder="09xxxxxxxxx"
        autoComplete="tel"
        error={errors.mobileNumber?.message}
        {...register('mobileNumber')}
      />
      <Input
        label="Email"
        type="email"
        placeholder="you@email.com"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />
      <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>
        Create account
      </Button>
      <p className="text-center text-sm text-slate-500">
        Already have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-indigo-600 font-medium hover:text-indigo-700"
        >
          Login
        </button>
      </p>
    </form>
  )
}
