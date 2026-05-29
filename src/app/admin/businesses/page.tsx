import type { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'

export const metadata: Metadata = { title: 'Businesses – Admin' }

const businesses = [
  { id: '1', name: 'Prime Cuts Barbershop', owner: 'Juan Dela Cruz', email: 'juan@primecuts.ph', category: 'Barbershop', slug: 'prime-cuts', bookings: 312, services: 5, status: 'active', joined: 'Jan 12, 2025' },
  { id: '2', name: 'Glow Studio', owner: 'Maria Santos', email: 'maria@glowstudio.ph', category: 'Salon', slug: 'glow-studio', bookings: 278, services: 8, status: 'active', joined: 'Feb 3, 2025' },
  { id: '3', name: 'HealthFirst Clinic', owner: 'Dr. Roberto Reyes', email: 'roberto@healthfirst.ph', category: 'Clinic', slug: 'healthfirst', bookings: 201, services: 12, status: 'active', joined: 'Feb 18, 2025' },
  { id: '4', name: 'The Nail Bar', owner: 'Ana Lim', email: 'ana@nailbar.ph', category: 'Salon', slug: 'nail-bar', bookings: 156, services: 6, status: 'active', joined: 'Mar 5, 2025' },
  { id: '5', name: 'FreshFade Shop', owner: 'Carlo Mendoza', email: 'carlo@freshfade.ph', category: 'Barbershop', slug: 'freshfade', bookings: 98, services: 3, status: 'inactive', joined: 'Mar 22, 2025' },
  { id: '6', name: 'Zen Spa & Wellness', owner: 'Sofia Cruz', email: 'sofia@zenspa.ph', category: 'Other', slug: 'zen-spa', bookings: 74, services: 10, status: 'active', joined: 'Apr 1, 2025' },
  { id: '7', name: 'BrightSmile Dental', owner: 'Dr. Anna Ramos', email: 'anna@brightsmile.ph', category: 'Clinic', slug: 'brightsmile', bookings: 45, services: 7, status: 'active', joined: 'Apr 14, 2025' },
  { id: '8', name: 'Urban Ink Studio', owner: 'Nico Bautista', email: 'nico@urbanink.ph', category: 'Other', slug: 'urban-ink', bookings: 29, services: 4, status: 'inactive', joined: 'May 2, 2025' },
]

export default function AdminBusinessesPage() {
  const total = businesses.length
  const active = businesses.filter((b) => b.status === 'active').length

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Businesses</h1>
          <p className="text-sm text-slate-500 mt-1">{total} registered &middot; {active} active</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: total, color: 'text-slate-900' },
          { label: 'Active', value: active, color: 'text-green-700' },
          { label: 'Inactive', value: total - active, color: 'text-slate-500' },
          { label: 'This Month', value: 3, color: 'text-indigo-600' },
        ].map((s) => (
          <Card key={s.label} className="p-4">
            <p className="text-xs text-slate-500">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Businesses</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {['Business', 'Owner', 'Category', 'Bookings', 'Services', 'Status', 'Joined', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {businesses.map((biz) => (
                <tr key={biz.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 text-xs font-bold">
                        {biz.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{biz.name}</p>
                        <code className="text-xs text-slate-400">{biz.slug}</code>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-slate-800">{biz.owner}</p>
                    <p className="text-xs text-slate-400">{biz.email}</p>
                  </td>
                  <td className="px-6 py-4 text-slate-600 capitalize">{biz.category}</td>
                  <td className="px-6 py-4 font-medium text-slate-700">{biz.bookings}</td>
                  <td className="px-6 py-4 text-slate-600">{biz.services}</td>
                  <td className="px-6 py-4">
                    <Badge variant={biz.status === 'active' ? 'success' : 'default'}>
                      {biz.status === 'active' ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-slate-500 whitespace-nowrap">{biz.joined}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Link href={`/${biz.slug}`} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                        View
                      </Link>
                      <button className="text-xs text-red-500 hover:text-red-700 font-medium">
                        {biz.status === 'active' ? 'Suspend' : 'Restore'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
