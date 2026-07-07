'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { useForgotPassword } from '@/features/auth/hooks/useForgotPassword'
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/features/auth/validation/forgotPassword.schema'

interface ForgotPasswordDialogProps {
  isOpen: boolean
  onClose: () => void
}

export default function ForgotPasswordDialog({ isOpen, onClose }: ForgotPasswordDialogProps) {
  const { status, error, submit, reset: resetHook } = useForgotPassword()

  const {
    register,
    handleSubmit,
    reset: resetForm,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const handleClose = () => {
    resetHook()
    resetForm()
    onClose()
  }

  const onSubmit = async ({ email }: ForgotPasswordFormData) => {
    await submit(email)
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      {status === 'success' ? (
        <div className="flex flex-col items-center gap-5 py-2 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
            <svg className="h-7 w-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-slate-900">Check your inbox</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              If an account exists for that email, you&apos;ll receive a password reset link shortly.
            </p>
          </div>
          <Button className="w-full" size="lg" onClick={handleClose}>
            Back to login
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-5 py-2">
          <div className="text-center space-y-2">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50">
              <svg className="h-7 w-7 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Reset your password</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Enter your email and we&apos;ll send you a reset link.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 px-4 py-3 rounded-r-lg">
              <p className="text-sm text-red-700">{error.message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              error={errors.email?.message}
              {...register('email')}
            />
            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={status === 'loading'}
            >
              Send reset link
            </Button>
          </form>
        </div>
      )}
    </Modal>
  )
}
