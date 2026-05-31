'use client'

import { useState } from 'react'
import Badge from '@/components/ui/Badge'
import type { AdminBusinessStatus } from '@/types'

const STATUS_BADGE: Record<AdminBusinessStatus, { variant: 'success' | 'warning' | 'danger' | 'default'; label: string }> = {
  approved: { variant: 'success', label: 'Approved' },
  pending: { variant: 'warning', label: 'Pending' },
  rejected: { variant: 'danger', label: 'Rejected' },
  inactive: { variant: 'default', label: 'Inactive' },
}

interface BusinessLike {
  id: string
  name: string
  slug: string
  status: AdminBusinessStatus
}

interface Props {
  business: BusinessLike
  submitting: boolean
  submitError: string | null
  onClose: () => void
  onSubmit: (id: string, status: 'approved' | 'rejected', reason?: string) => Promise<void>
}

export default function UpdateStatusModal({ business, submitting, submitError, onClose, onSubmit }: Props) {
  const [selectedStatus, setSelectedStatus] = useState<'approved' | 'rejected' | ''>('')
  const [reason, setReason] = useState('')

  const currentBadge = STATUS_BADGE[business.status] ?? { variant: 'default' as const, label: business.status }
  const isValid = selectedStatus !== '' && (selectedStatus !== 'rejected' || reason.trim() !== '')

  function handleSubmit() {
    if (!isValid || submitting) return
    onSubmit(business.id, selectedStatus as 'approved' | 'rejected', selectedStatus === 'rejected' ? reason.trim() : undefined)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-xl bg-white shadow-xl ring-1 ring-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-semibold text-slate-900">Update Business Status</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          <div>
            <p className="text-sm font-medium text-slate-700 mb-1">{business.name}</p>
            <p className="text-xs text-slate-400 font-mono">{business.slug}</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Current status:</span>
            <Badge variant={currentBadge.variant}>{currentBadge.label}</Badge>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700">New status</label>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value as 'approved' | 'rejected' | '')
                if (e.target.value !== 'rejected') setReason('')
              }}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300"
            >
              <option value="">Select a status…</option>
              <option value="approved">Approve</option>
              <option value="rejected">Reject</option>
            </select>
          </div>

          {selectedStatus === 'rejected' && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">
                Reason for rejection <span className="text-red-500">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder="Explain why this business is being rejected…"
                className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300"
              />
            </div>
          )}

          {submitError && (
            <div className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2.5">
              <svg className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              <p className="text-xs text-red-600">{submitError}</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
          <button
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isValid || submitting}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting && (
              <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {submitting ? 'Updating…' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  )
}
