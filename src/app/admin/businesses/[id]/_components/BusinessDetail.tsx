'use client'

import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { useAdminBusiness } from '../_hooks/useAdminBusiness'
import UpdateStatusModal from '../../_components/UpdateStatusModal'
import type { AdminBusinessStatus } from '@/types'

const STATUS_BADGE: Record<AdminBusinessStatus, { variant: 'success' | 'warning' | 'danger' | 'default'; label: string }> = {
  approved: { variant: 'success', label: 'Approved' },
  pending:  { variant: 'warning', label: 'Pending'  },
  rejected: { variant: 'danger',  label: 'Rejected' },
  inactive: { variant: 'default', label: 'Inactive' },
}

function Field({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
      <p className="mt-1 text-sm text-slate-800">{value ?? '—'}</p>
    </div>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-PH', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function BusinessDetail({ id }: { id: string }) {
  const { business, loading, error, modalOpen, submitting, submitError, openStatusModal, closeStatusModal, submitStatusUpdate } = useAdminBusiness(id)

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="h-6 w-48 bg-slate-100 rounded animate-pulse mb-4" />
        <div className="h-64 bg-slate-100 rounded-xl animate-pulse" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <p className="text-sm text-red-600 mb-4">{error}</p>
        <Link href="/admin/businesses" className="text-sm text-indigo-600 hover:underline">← Back to businesses</Link>
      </div>
    )
  }

  if (!business) return null

  const badge = STATUS_BADGE[business.status] ?? { variant: 'default' as const, label: business.status }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/admin/businesses" className="text-xs text-slate-400 hover:text-indigo-600 transition-colors">
            ← All Businesses
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">{business.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <code className="text-xs text-slate-400">{business.slug}</code>
            <Badge variant={badge.variant}>{badge.label}</Badge>
          </div>
        </div>
        <button
          onClick={openStatusModal}
          className="shrink-0 px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition-colors"
        >
          Update Status
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Services', value: business.services_count },
          { label: 'Bookings', value: business.bookings_count },
          { label: 'Category', value: business.category_name ?? '—' },
        ].map((s) => (
          <Card key={s.label} className="p-4 text-center">
            <p className="text-xs text-slate-500">{s.label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{s.value}</p>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Business Info</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Name" value={business.name} />
            <Field label="Slug" value={business.slug} />
            <Field label="Category" value={business.category_name} />
            <Field label="Status" value={badge.label} />
            <Field label="Phone" value={business.phone} />
            <Field label="City" value={business.city} />
            <Field label="Address" value={business.address} />
            <Field label="Registered" value={formatDate(business.created_at)} />
            {business.description && (
              <div className="sm:col-span-2">
                <Field label="Description" value={business.description} />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Owner Info</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Name" value={business.owner_name} />
            <Field label="Email" value={business.email} />
            <Field label="Phone" value={business.owner_phone} />
            <Field label="Owner ID" value={business.owner_id} />
          </div>
        </CardContent>
      </Card>

      {modalOpen && (
        <UpdateStatusModal
          business={business}
          submitting={submitting}
          submitError={submitError}
          onClose={closeStatusModal}
          onSubmit={submitStatusUpdate}
        />
      )}
    </div>
  )
}
