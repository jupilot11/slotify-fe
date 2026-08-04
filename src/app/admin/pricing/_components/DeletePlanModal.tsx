'use client'

import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import type { SubscriptionPlan } from '@/types'

interface Props {
  plan: SubscriptionPlan | null
  isSubmitting: boolean
  submitError: string | null
  onClose: () => void
  onConfirm: () => Promise<void>
}

export default function DeletePlanModal({ plan, isSubmitting, submitError, onClose, onConfirm }: Props) {
  return (
    <Modal isOpen={plan !== null} onClose={onClose} title="Delete plan?">
      <p className="text-sm text-slate-600">
        This will permanently delete{' '}
        <span className="font-semibold text-slate-900">{plan?.display_name}</span>.
        This action cannot be undone.
      </p>

      {submitError && (
        <div className="mt-4 flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2.5">
          <svg className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <p className="text-xs text-red-600">{submitError}</p>
        </div>
      )}

      <div className="flex justify-end gap-3 mt-6">
        <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm} isLoading={isSubmitting} disabled={isSubmitting}>
          {isSubmitting ? 'Deleting…' : 'Delete'}
        </Button>
      </div>
    </Modal>
  )
}
