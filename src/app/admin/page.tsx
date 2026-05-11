import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllBusinesses } from '@/services/business.service'
import { getBookings } from '@/services/booking.service'
import Badge from '@/components/ui/Badge'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/Card'
import Logo from '@/components/layout/Logo'

export const metadata: Metadata = { title: 'Admin – Slotify' }

export default async function AdminPage() {
  const [businessResult] = await Promise.all([getAllBusinesses()])
  const businesses = businessResult.data

  const bookingCounts = await Promise.all(
    businesses.map(async (biz) => {
      const result = await getBookings(biz.id)
      return { businessId: biz.id, count: result.total }
    })
  )

  const countMap = Object.fromEntries(bookingCounts.map((b) => [b.businessId, b.count]))

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 h-16 flex items-center px-6 gap-6">
        <Logo />
        <span className="text-sm font-medium text-slate-500 bg-red-100 text-red-700 px-3 py-1 rounded-full">
          Admin Panel
        </span>
        <div className="ml-auto">
          <Link href="/dashboard" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
            Back to dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Platform stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-6">
            <p className="text-sm text-slate-500">Total Businesses</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{businesses.length}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-slate-500">Active Businesses</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">
              {businesses.filter((b) => b.isActive).length}
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-slate-500">Total Bookings</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">
              {Object.values(countMap).reduce((a, b) => a + b, 0)}
            </p>
          </Card>
        </div>

        {/* Businesses table */}
        <Card>
          <CardHeader>
            <CardTitle>All Businesses</CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Business
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Category
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Slug
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Bookings
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {businesses.map((biz) => (
                  <tr key={biz.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">{biz.name}</p>
                      {biz.address && (
                        <p className="text-xs text-slate-400 mt-0.5">{biz.address}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="capitalize text-slate-600">{biz.category}</span>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {biz.slug}
                      </code>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{countMap[biz.id] ?? 0}</td>
                    <td className="px-6 py-4">
                      <Badge variant={biz.isActive ? 'success' : 'default'}>
                        {biz.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/${biz.slug}`}
                        className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        View page
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </main>
    </div>
  )
}
