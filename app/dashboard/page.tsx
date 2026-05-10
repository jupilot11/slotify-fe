import StatCard from '@/features/dashboard/components/StatCard'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/Card'
import { formatDate, formatTime, formatCurrency } from '@/lib/utils'
import type { Booking } from '@/types'
import Link from 'next/link'

const recentBookings: Booking[] = [
  {
    id: '1',
    businessId: 'b1',
    serviceId: 's1',
    serviceName: 'Haircut & Styling',
    customerName: 'Maria Santos',
    customerEmail: 'maria@example.com',
    customerPhone: '+63 912 345 6789',
    date: '2026-05-09',
    time: '09:00',
    status: 'confirmed',
    createdAt: '2026-05-08T10:00:00Z',
  },
  {
    id: '2',
    businessId: 'b1',
    serviceId: 's2',
    serviceName: 'Beard Trim',
    customerName: 'Juan dela Cruz',
    customerEmail: 'juan@example.com',
    date: '2026-05-09',
    time: '10:30',
    status: 'pending',
    createdAt: '2026-05-08T11:00:00Z',
  },
  {
    id: '3',
    businessId: 'b1',
    serviceId: 's1',
    serviceName: 'Full Body Massage',
    customerName: 'Ana Reyes',
    customerEmail: 'ana@example.com',
    date: '2026-05-09',
    time: '13:00',
    status: 'completed',
    createdAt: '2026-05-07T09:00:00Z',
  },
  {
    id: '4',
    businessId: 'b1',
    serviceId: 's3',
    serviceName: 'Manicure & Pedicure',
    customerName: 'Rosa Garcia',
    customerEmail: 'rosa@example.com',
    date: '2026-05-10',
    time: '14:00',
    status: 'pending',
    createdAt: '2026-05-08T14:00:00Z',
  },
  {
    id: '5',
    businessId: 'b1',
    serviceId: 's2',
    serviceName: 'Haircut & Styling',
    customerName: 'Carlo Mendoza',
    customerEmail: 'carlo@example.com',
    date: '2026-05-08',
    time: '15:30',
    status: 'cancelled',
    createdAt: '2026-05-07T16:00:00Z',
  },
]

const statusStyles: Record<string, string> = {
  confirmed: 'bg-green-50 text-green-700',
  pending: 'bg-amber-50 text-amber-700',
  completed: 'bg-slate-100 text-slate-600',
  cancelled: 'bg-red-50 text-red-600',
}

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Bookings"
          value="128"
          change="↑ 12% from last month"
          trend="up"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          }
        />
        <StatCard
          title="Revenue This Month"
          value={formatCurrency(42500)}
          change="↑ 8% from last month"
          trend="up"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />
        <StatCard
          title="Active Services"
          value="6"
          change="Same as last month"
          trend="neutral"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          }
        />
        <StatCard
          title="Pending Bookings"
          value="14"
          change="↓ 3 from yesterday"
          trend="down"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />
      </div>

      {/* Recent bookings + Quick actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent bookings */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Bookings</CardTitle>
            <Link
              href="/dashboard/bookings"
              className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
            >
              View all
            </Link>
          </CardHeader>
          <div className="divide-y divide-slate-100">
            {recentBookings.map((booking) => (
              <div key={booking.id} className="flex items-center gap-4 px-6 py-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 text-sm font-semibold">
                  {booking.customerName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{booking.customerName}</p>
                  <p className="text-xs text-slate-500 truncate">{booking.serviceName}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-medium text-slate-700">{formatDate(booking.date)}</p>
                  <p className="text-xs text-slate-500">{formatTime(booking.time)}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusStyles[booking.status]}`}
                >
                  {booking.status}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick actions */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link
                href="/dashboard/bookings"
                className="flex items-center gap-3 rounded-lg p-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <span className="font-medium">New Booking</span>
              </Link>
              <Link
                href="/dashboard/services"
                className="flex items-center gap-3 rounded-lg p-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50 text-green-600">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <span className="font-medium">Manage Services</span>
              </Link>
              <Link
                href="/dashboard/settings"
                className="flex items-center gap-3 rounded-lg p-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="font-medium">Settings</span>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Today&apos;s Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentBookings
                .filter((b) => b.date === '2026-05-09' && b.status !== 'cancelled')
                .map((booking) => (
                  <div key={booking.id} className="flex items-center gap-3">
                    <div className="w-12 shrink-0 text-right text-xs font-medium text-slate-500">
                      {formatTime(booking.time)}
                    </div>
                    <div className="h-full w-px bg-indigo-200 self-stretch" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-800 truncate">{booking.customerName}</p>
                      <p className="text-xs text-slate-500 truncate">{booking.serviceName}</p>
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
