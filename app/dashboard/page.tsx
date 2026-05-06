import type { Metadata } from 'next'
import TopBar from '@/components/layout/TopBar'
import StatCard from '@/features/dashboard/components/StatCard'
import BookingStatusBadge from '@/features/booking/components/BookingStatusBadge'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/Card'
import { getBookings } from '@/services/booking.service'
import { getServicesByBusiness } from '@/services/catalog.service'
import { formatTime } from '@/lib/utils'
import { DEFAULT_BUSINESS_ID } from '@/constants'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Dashboard – Slotify' }

function CalendarIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  )
}

function ListIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
      />
    </svg>
  )
}

function CurrencyIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  )
}

export default async function DashboardPage() {
  const [bookingsResult, servicesResult] = await Promise.all([
    getBookings(DEFAULT_BUSINESS_ID),
    getServicesByBusiness(DEFAULT_BUSINESS_ID),
  ])

  const bookings = bookingsResult.data
  const services = servicesResult.data

  const today = new Date().toISOString().split('T')[0]
  const todayBookings = bookings.filter((b) => b.date === today)
  const pendingCount = bookings.filter((b) => b.status === 'pending').length
  const activeServices = services.filter((s) => s.status === 'active').length
  const completedRevenue = bookings.filter((b) => b.status === 'completed').length * 42

  const recentBookings = [...bookings]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 6)

  return (
    <div>
      <TopBar title="Dashboard" subtitle="Welcome back, Alex" />
      <div className="p-6 space-y-6">
        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Today's Bookings"
            value={todayBookings.length}
            change={todayBookings.length > 0 ? 'Appointments today' : 'No bookings today'}
            trend="neutral"
            icon={<CalendarIcon />}
          />
          <StatCard
            title="Pending"
            value={pendingCount}
            change={pendingCount > 0 ? 'Needs your review' : 'All confirmed'}
            trend={pendingCount > 0 ? 'down' : 'neutral'}
            icon={<ClockIcon />}
          />
          <StatCard
            title="Active Services"
            value={activeServices}
            change={`${services.length} total services`}
            trend="neutral"
            icon={<ListIcon />}
          />
          <StatCard
            title="Revenue (MTD)"
            value={`$${completedRevenue}`}
            change="From completed bookings"
            trend="up"
            icon={<CurrencyIcon />}
          />
        </div>

        {/* Recent bookings */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Recent Bookings</CardTitle>
            <Link
              href="/dashboard/bookings"
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              View all
            </Link>
          </CardHeader>
          <div className="divide-y divide-slate-50">
            {recentBookings.length === 0 ? (
              <div className="py-12 text-center text-sm text-slate-400">No bookings yet</div>
            ) : (
              recentBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {booking.customerName}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {booking.serviceName} · {booking.date} at {formatTime(booking.time)}
                    </p>
                  </div>
                  <BookingStatusBadge status={booking.status} />
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/dashboard/bookings"
            className="bg-white rounded-xl border border-slate-200 p-5 hover:border-indigo-200 hover:shadow-sm transition-all group"
          >
            <p className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
              Manage bookings
            </p>
            <p className="text-sm text-slate-500 mt-1">View and update booking statuses</p>
          </Link>
          <Link
            href="/dashboard/services"
            className="bg-white rounded-xl border border-slate-200 p-5 hover:border-indigo-200 hover:shadow-sm transition-all group"
          >
            <p className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
              Manage services
            </p>
            <p className="text-sm text-slate-500 mt-1">Add, edit, or remove your services</p>
          </Link>
          <Link
            href="/jays-barbershop"
            className="bg-white rounded-xl border border-slate-200 p-5 hover:border-indigo-200 hover:shadow-sm transition-all group"
          >
            <p className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
              View booking page
            </p>
            <p className="text-sm text-slate-500 mt-1">See your public-facing booking page</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
