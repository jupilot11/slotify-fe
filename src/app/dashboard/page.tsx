'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useBusinessContext } from '@/lib/contexts/BusinessContext'
import Button from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import EmptyState from '@/components/ui/EmptyState'
import BusinessCard from '@/features/businesses/components/BusinessCard'

function BusinessCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 animate-pulse">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="h-12 w-12 rounded-xl bg-slate-200 shrink-0" />
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-slate-200 rounded w-3/4" />
            <div className="h-3 bg-slate-200 rounded w-1/2" />
          </div>
        </div>
        <div className="h-5 w-16 bg-slate-100 rounded-full shrink-0" />
      </div>
      <div className="h-px bg-slate-100" />
      <div className="h-3 bg-slate-100 rounded w-32" />
    </div>
  )
}

export default function DashboardPage() {
  const { businesses, status, error } = useBusinessContext()
  const router = useRouter()

  if (status === 'idle' || status === 'loading') {
    return (
      <div className="p-6 sm:p-8 max-w-5xl mx-auto space-y-6">
        <div className="space-y-1">
          <Skeleton className="h-8 w-48 rounded" />
          <Skeleton className="h-4 w-64 rounded" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <BusinessCardSkeleton />
          <BusinessCardSkeleton />
          <BusinessCardSkeleton />
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="p-6">
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <svg className="h-5 w-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <p className="text-sm text-red-700">{error ?? 'Failed to load businesses.'}</p>
        </div>
      </div>
    )
  }

  if (businesses.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <EmptyState
          title="You don't have any businesses yet."
          description="Create your first business to start managing bookings and services."
          icon={
            <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
          action={
            <Button size="lg" onClick={() => router.push('/dashboard/businesses/new')}>
              Create Your First Business
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Your Businesses</h1>
        <p className="text-sm text-slate-500 mt-1">
          {businesses.length === 1
            ? '1 business registered'
            : `${businesses.length} businesses registered`}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {businesses.map((business) => (
          <BusinessCard key={business.id} business={business} />
        ))}

        {/* Add business inline card */}
        <Link
          href="/dashboard/businesses/new"
          className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-200 p-5 text-slate-400 hover:border-indigo-300 hover:text-indigo-500 hover:bg-indigo-50/40 transition-all duration-200 min-h-[130px]"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 transition-colors">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span className="text-sm font-medium">Add New Business</span>
        </Link>
      </div>
    </div>
  )
}
