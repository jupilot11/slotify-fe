'use client'

import { useRouter } from 'next/navigation'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'

interface PasswordSetupDialogProps {
  isOpen: boolean
  onClose: () => void
  email?: string | null
}

export default function PasswordSetupDialog({ isOpen, onClose, email }: PasswordSetupDialogProps) {
  const router = useRouter()

  const handleContinue = () => {
    onClose()
    const params = email ? `?email=${encodeURIComponent(email)}` : ''
    router.push(`/auth/set-password${params}`)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col items-center gap-5 py-2 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50">
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

        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-slate-900">Set up your password</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Your email has been verified. To complete your account setup, you need to create a
            password before you can sign in.
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 pt-1">
          <Button className="w-full" size="lg" onClick={handleContinue}>
            Set up password
          </Button>
          <Button className="w-full" variant="ghost" size="lg" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  )
}
