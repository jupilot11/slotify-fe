'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useBusinessContext } from '@/lib/contexts/BusinessContext'
import Button from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import EmptyState from '@/components/ui/EmptyState'

function BusinessCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-xl bg-slate-200 shrink-0" />
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-slate-200 rounded w-3/4" />
          <div className="h-3 bg-slate-200 rounded w-1/2" />
        </div>
      </div>
      <div className="h-9 bg-slate-100 rounded-lg" />
    </div>
  )
}

export default function DashboardPage() {
  const { businesses, status, error } = useBusinessContext()
  const router = useRouter()

  if (status === 'idle' || status === 'loading') {
    return (
      <div className="p-6 space-y-6">
        <div className="space-y-1">
          <Skeleton className="h-7 w-48 rounded" />
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
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
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
    <div className="p-4 sm:p-6 space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Your Businesses</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {businesses.length === 1
              ? '1 business registered'
              : `${businesses.length} businesses registered`}
          </p>
        </div>
        <Link href="/dashboard/businesses/new">
          <Button size="sm">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Business
          </Button>
        </Link>
      </div>

      {/* Business grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {businesses.map((business) => (
          <div
            key={business.id}
            className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-200 overflow-hidden"
          >
            <div className="p-5">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 font-semibold text-lg overflow-hidden">
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
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 truncate">{business.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {business.category_name ?? 'Uncategorized'}
                    {business.city ? ` · ${business.city}` : ''}
                  </p>
                </div>
              </div>
              <Link href={`/dashboard/businesses/${business.slug}`} className="block">
                <Button variant="outline" size="sm" className="w-full">
                  Open Dashboard
                </Button>
              </Link>
            </div>
          </div>
        ))}

        {/* Add business card */}
        <Link
          href="/dashboard/businesses/new"
          className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-200 p-5 text-slate-400 hover:border-indigo-300 hover:text-indigo-500 hover:bg-indigo-50/40 transition-all duration-200 min-h-[140px]"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 group-hover:bg-indigo-100 transition-colors">
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
