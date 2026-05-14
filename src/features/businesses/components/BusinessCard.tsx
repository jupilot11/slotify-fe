'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import type { BusinessSummary } from '@/types'
import { useDeleteBusiness } from '@/features/businesses/hooks/useDeleteBusiness'
import { useBusinessContext } from '@/lib/contexts/BusinessContext'

function StatusBadge({ status }: { status: string }) {
  const isActive = status === 'active'
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium shrink-0',
        isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500',
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', isActive ? 'bg-emerald-500' : 'bg-slate-400')} />
      {isActive ? 'Active' : 'Inactive'}
    </span>
  )
}

function DeleteDialog({
  business,
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
  isDeleted,
  error,
}: {
  business: BusinessSummary
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  isDeleting: boolean
  isDeleted: boolean
  error: string | null
}) {
  if (isDeleted) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Business Deleted">
        <div className="space-y-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100">
              <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">
                &ldquo;{business.name}&rdquo; has been deleted.
              </p>
              <p className="mt-1 text-sm text-slate-500">
                The business and all its data have been permanently removed.
              </p>
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={onClose}>Done</Button>
          </div>
        </div>
      </Modal>
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Business">
      <div className="space-y-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
            <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900">
              Delete &ldquo;{business.name}&rdquo;?
            </p>
            <p className="mt-1 text-sm text-slate-500">
              This will permanently remove this business and all its data. This action cannot be undone.
            </p>
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="danger" isLoading={isDeleting} disabled={isDeleting} onClick={onConfirm}>
            Delete Business
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default function BusinessCard({ business }: { business: BusinessSummary }) {
  const router = useRouter()
  const { reload } = useBusinessContext()
  const [menuOpen, setMenuOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const { remove, status: deleteStatus, error: deleteError } = useDeleteBusiness()
  const isDeleting = deleteStatus === 'loading'

  const isDeleted = deleteStatus === 'success'

  async function handleDeleteConfirm() {
    await remove(business.id)
  }

  function handleDeleteClose() {
    if (isDeleting) return
    setDeleteOpen(false)
    if (isDeleted) reload()
  }

  useEffect(() => {
    if (!menuOpen) return
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        className="group relative bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-indigo-200 transition-all duration-200 cursor-pointer overflow-hidden flex flex-col"
        onClick={() => router.push(`/dashboard/businesses/${business.slug}`)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') router.push(`/dashboard/businesses/${business.slug}`)
        }}
      >
        {/* Gradient header */}
        <div className="relative h-24 bg-gradient-to-br from-indigo-100 via-violet-50 to-sky-100 shrink-0">
          {/* Three-dot menu */}
          <div ref={menuRef} className="absolute top-3 right-3">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setMenuOpen((o) => !o)
              }}
              className="flex h-7 w-7 items-center justify-center rounded-md text-indigo-400 hover:bg-white/60 hover:text-indigo-700 transition-colors"
              aria-label="Business options"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>

            {menuOpen && (
              <div
                className="absolute right-0 top-8 z-20 w-36 rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  onClick={() => {
                    setMenuOpen(false)
                    router.push(`/dashboard/businesses/${business.slug}/edit`)
                  }}
                >
                  <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </button>
                <button
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  onClick={() => {
                    setMenuOpen(false)
                    setDeleteOpen(true)
                  }}
                >
                  <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              </div>
            )}
          </div>

          {/* Logo overlapping the gradient border */}
          <div className="absolute -bottom-7 left-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-white border-2 border-slate-100 shadow-md text-indigo-600 font-bold text-xl overflow-hidden">
            {business.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={business.logo_url}
                alt={business.name}
                className="h-full w-full object-cover"
              />
            ) : (
              business.name.charAt(0).toUpperCase()
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 pt-10 pb-4 px-5">
          <p className="font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors text-base leading-snug">
            {business.name}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {business.category_name ?? 'Uncategorized'}
            {business.city ? <span className="text-slate-300"> · </span> : null}
            {business.city && <span className="text-slate-400">{business.city}</span>}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
          <StatusBadge status={business.status} />
          <svg
            className="h-4 w-4 text-indigo-400 -translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-200"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>

      <DeleteDialog
        business={business}
        isOpen={deleteOpen}
        onClose={handleDeleteClose}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
        isDeleted={isDeleted}
        error={deleteError}
      />
    </>
  )
}
