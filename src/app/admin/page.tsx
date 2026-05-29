import type { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'

export const metadata: Metadata = { title: 'Overview – Admin' }

const stats = [
  { label: 'Total Users', value: '1,284', change: '+12 this week', trend: 'up' },
  { label: 'Total Businesses', value: '47', change: '+3 this month', trend: 'up' },
  { label: 'Bookings Today', value: '138', change: '-5 vs yesterday', trend: 'down' },
  { label: 'Monthly Revenue', value: '₱48,200', change: '+8.4% vs last month', trend: 'up' },
]

const recentActivity = [
  { id: 1, type: 'business', message: 'New business "Glow Studio" registered', time: '2 min ago', badge: 'info' as const },
  { id: 2, type: 'user', message: 'User juan.dela.cruz@email.com verified their email', time: '14 min ago', badge: 'success' as const },
  { id: 3, type: 'booking', message: 'Booking #BK-2291 cancelled by customer', time: '31 min ago', badge: 'warning' as const },
  { id: 4, type: 'business', message: 'Business "Prime Cuts" suspended by admin', time: '1 hr ago', badge: 'danger' as const },
  { id: 5, type: 'user', message: 'New user maria.santos@email.com registered', time: '2 hr ago', badge: 'info' as const },
  { id: 6, type: 'booking', message: '42 bookings completed across all businesses', time: '3 hr ago', badge: 'success' as const },
]

const topBusinesses = [
  { name: 'Prime Cuts Barbershop', slug: 'prime-cuts', bookings: 312, category: 'Barbershop', status: 'active' },
  { name: 'Glow Studio', slug: 'glow-studio', bookings: 278, category: 'Salon', status: 'active' },
  { name: 'HealthFirst Clinic', slug: 'healthfirst', bookings: 201, category: 'Clinic', status: 'active' },
  { name: 'The Nail Bar', slug: 'nail-bar', bookings: 156, category: 'Salon', status: 'active' },
  { name: 'FreshFade Shop', slug: 'freshfade', bookings: 98, category: 'Barbershop', status: 'inactive' },
]

export default function AdminOverviewPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Platform Overview</h1>
        <p className="text-sm text-slate-500 mt-1">Welcome back. Here&apos;s what&apos;s happening across Slotify.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-5">
            <p className="text-sm text-slate-500">{stat.label}</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</p>
            <p className={`text-xs mt-2 font-medium ${stat.trend === 'up' ? 'text-green-600' : 'text-red-500'}`}>
              {stat.change}
            </p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-slate-50">
              {recentActivity.map((item) => (
                <li key={item.id} className="flex items-start gap-3 px-6 py-3.5">
                  <Badge variant={item.badge} className="mt-0.5 shrink-0 capitalize">{item.type}</Badge>
                  <p className="flex-1 text-sm text-slate-700 leading-snug">{item.message}</p>
                  <span className="text-xs text-slate-400 shrink-0">{item.time}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Quick Actions</h3>
            <ul className="space-y-2">
              {[
                { label: 'View all businesses', href: '/admin/businesses' },
                { label: 'Manage users', href: '/admin/users' },
                { label: 'Review bookings', href: '/admin/bookings' },
                { label: 'Platform settings', href: '/admin/settings' },
              ].map((action) => (
                <li key={action.href}>
                  <Link
                    href={action.href}
                    className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors group"
                  >
                    {action.label}
                    <svg className="h-4 w-4 text-slate-300 group-hover:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>

          {/* Top Businesses */}
          <Card>
            <CardHeader>
              <CardTitle>Top Businesses</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ul className="divide-y divide-slate-50">
                {topBusinesses.map((biz) => (
                  <li key={biz.slug} className="flex items-center gap-3 px-6 py-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 text-xs font-bold">
                      {biz.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{biz.name}</p>
                      <p className="text-xs text-slate-400">{biz.category}</p>
                    </div>
                    <span className="text-sm font-semibold text-slate-700">{biz.bookings}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
