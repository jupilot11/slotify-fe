'use client'

import Link from 'next/link'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { useAdminBusinesses } from '../_hooks/useAdminBusinesses'
import UpdateStatusModal from './UpdateStatusModal'
import type { AdminBusiness, AdminBusinessStatus } from '@/types'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const STATUS_BADGE: Record<AdminBusinessStatus, { variant: 'success' | 'warning' | 'danger' | 'default'; label: string; dot: string }> = {
  approved: { variant: 'success', label: 'Approved', dot: 'bg-emerald-500' },
  pending: { variant: 'warning', label: 'Pending', dot: 'bg-amber-500' },
  rejected: { variant: 'danger', label: 'Rejected', dot: 'bg-red-500' },
  inactive: { variant: 'default', label: 'Inactive', dot: 'bg-slate-400' },
}

function StatusBadge({ status }: { status: AdminBusinessStatus }) {
  const cfg = STATUS_BADGE[status] ?? { variant: 'default' as const, label: status, dot: 'bg-slate-400' }
  return (
    <Badge variant={cfg.variant}>
      <span className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </Badge>
  )
}

function SummaryCard({
  label,
  value,
  loading,
  icon,
  iconBg,
  iconColor,
  valueColor,
}: {
  label: string
  value: number
  loading: boolean
  icon: React.ReactNode
  iconBg: string
  iconColor: string
  valueColor: string
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${iconBg} ${iconColor}`}>
          {icon}
        </div>
      </div>
      <div className="mt-3">
        {loading ? (
          <Skeleton className="h-9 w-20" />
        ) : (
          <p className={`text-3xl font-bold tracking-tight ${valueColor}`}>
            {(value ?? 0).toLocaleString()}
          </p>
        )}
      </div>
    </Card>
  )
}

export default function BusinessesTable() {
  const {
    businesses,
    totalFiltered,
    activeCount,
    inactiveCount,
    thisMonthCount,
    loading,
    error,
    hasMore,
    sentinelRef,
    modalBusiness,
    submitting,
    submitError,
    rawSearch,
    statusFilter,
    setRawSearch,
    setStatusFilter,
    openStatusModal,
    closeStatusModal,
    submitStatusUpdate,
  } = useAdminBusinesses()

  const isInitialLoad = loading && businesses.length === 0

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <SummaryCard
          label="Total Businesses"
          value={totalFiltered}
          loading={isInitialLoad}
          iconBg="bg-indigo-50"
          iconColor="text-indigo-600"
          valueColor="text-slate-900"
          icon={
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
            </svg>
          }
        />
        <SummaryCard
          label="Active"
          value={activeCount}
          loading={isInitialLoad}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          valueColor="text-emerald-700"
          icon={
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <SummaryCard
          label="Inactive"
          value={inactiveCount}
          loading={isInitialLoad}
          iconBg="bg-slate-100"
          iconColor="text-slate-500"
          valueColor="text-slate-600"
          icon={
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          }
        />
        <SummaryCard
          label="Joined This Month"
          value={thisMonthCount}
          loading={isInitialLoad}
          iconBg="bg-violet-50"
          iconColor="text-violet-600"
          valueColor="text-violet-700"
          icon={
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          }
        />
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
            <div className="flex items-center gap-2.5">
              <CardTitle>All Businesses</CardTitle>
              {loading ? (
                <svg className="h-4 w-4 animate-spin text-indigo-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                  {totalFiltered.toLocaleString()}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <svg
                  className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search businesses…"
                  value={rawSearch}
                  onChange={(e) => setRawSearch(e.target.value)}
                  className="text-sm border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 w-52 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 placeholder:text-slate-400"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as AdminBusinessStatus | '')}
                className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 text-slate-700 bg-white"
              >
                <option value="">All statuses</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </CardHeader>

        {error && (
          <div className="flex items-center gap-2 px-6 py-3 bg-red-50 border-b border-red-100">
            <svg className="h-4 w-4 flex-shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70">
                {['Business', 'Owner', 'Category', 'Status', 'Joined', 'Actions'].map((h) => (
                  <th
                    key={h}
                    className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading && businesses.length === 0 ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-9 w-9 rounded-lg flex-shrink-0" />
                        <div className="space-y-2">
                          <Skeleton className="h-3.5 w-32" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <Skeleton className="h-3.5 w-28" />
                        <Skeleton className="h-3 w-36" />
                      </div>
                    </td>
                    <td className="px-6 py-4"><Skeleton className="h-3.5 w-20" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-16 rounded-full" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-3.5 w-24" /></td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-6 w-12 rounded-md" />
                        <Skeleton className="h-6 w-24 rounded-md" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : businesses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                        <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-slate-600">No businesses found</p>
                      <p className="text-xs text-slate-400">Try adjusting your search or filter criteria</p>
                    </div>
                  </td>
                </tr>
              ) : (
                businesses.map((biz: AdminBusiness) => (
                  <tr key={biz.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 text-sm font-bold">
                          {biz.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 leading-tight">{biz.name}</p>
                          <p className="text-xs text-slate-400 font-mono mt-0.5">{biz.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-800">{biz.owner_name ?? '—'}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{biz.email ?? '—'}</p>
                    </td>
                    <td className="px-6 py-4 capitalize text-slate-600">{biz.category_name ?? '—'}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={biz.status} />
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                      {formatDate(biz.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/businesses/${biz.id}`}
                          className="inline-flex items-center rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-100 transition-colors"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => openStatusModal(biz)}
                          className="inline-flex items-center rounded-md bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                        >
                          Update Status
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div ref={sentinelRef} />
        {loading && businesses.length > 0 && (
          <div className="flex justify-center py-4">
            <svg className="h-5 w-5 animate-spin text-indigo-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        )}
        {!hasMore && businesses.length > 0 && (
          <p className="py-4 text-center text-xs text-slate-400">All businesses loaded</p>
        )}
      </Card>

      {modalBusiness && (
        <UpdateStatusModal
          business={modalBusiness}
          submitting={submitting}
          submitError={submitError}
          onClose={closeStatusModal}
          onSubmit={submitStatusUpdate}
        />
      )}
    </div>
  )
}
