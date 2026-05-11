'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useBusinessContext } from '@/lib/contexts/BusinessContext'
import { Card, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { SkeletonCard } from '@/components/ui/Skeleton'
import EmptyState from '@/components/ui/EmptyState'

export default function DashboardPage() {
  const { businesses, status, error } = useBusinessContext()
  const router = useRouter()

  if (status === 'idle' || status === 'loading') {
    return (
      <div className="p-6 space-y-3">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="p-6">
        <p className="text-sm text-red-600">{error ?? 'Failed to load businesses.'}</p>
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
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-semibold text-slate-900">Your Businesses</h1>

      <div className="space-y-3">
        {businesses.map((business) => (
          <Card key={business.id} className="hover:shadow-md transition-shadow">
            <CardContent className="flex items-center gap-4 py-4">
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
                <p className="text-sm font-semibold text-slate-900 truncate">{business.name}</p>
                <p className="text-xs text-slate-500">
                  {business.business_categories?.name ?? '—'}
                  {business.city ? ` · ${business.city}` : ''}
                </p>
              </div>
              <Link href={`/dashboard/businesses/${business.slug}`}>
                <Button variant="outline" size="sm">
                  Open Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <Link href="/dashboard/businesses/new">
          <Button variant="outline">+ Add New Business</Button>
        </Link>
      </div>
    </div>
  )
}
