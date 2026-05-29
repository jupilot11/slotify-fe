import type { Metadata } from 'next'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import type { BookingStatus } from '@/types'

export const metadata: Metadata = { title: 'Bookings – Admin' }

const bookings: {
  id: string
  ref: string
  customer: string
  email: string
  business: string
  service: string
  date: string
  time: string
  status: BookingStatus
}[] = [
  { id: '1', ref: 'BK-2301', customer: 'Pedro Reyes', email: 'pedro.reyes@gmail.com', business: 'Prime Cuts Barbershop', service: 'Haircut & Style', date: 'May 28, 2025', time: '09:00 AM', status: 'confirmed' },
  { id: '2', ref: 'BK-2300', customer: 'Luisa Garcia', email: 'luisa.garcia@email.com', business: 'Glow Studio', service: 'Full Hair Color', date: 'May 28, 2025', time: '10:30 AM', status: 'pending' },
  { id: '3', ref: 'BK-2299', customer: 'Ben Torres', email: 'ben.torres@email.com', business: 'HealthFirst Clinic', service: 'General Consultation', date: 'May 27, 2025', time: '02:00 PM', status: 'completed' },
  { id: '4', ref: 'BK-2298', customer: 'Carla Bautista', email: 'carla.b@email.com', business: 'The Nail Bar', service: 'Gel Manicure', date: 'May 27, 2025', time: '11:00 AM', status: 'completed' },
  { id: '5', ref: 'BK-2297', customer: 'Rico Navarro', email: 'rico.navarro@email.com', business: 'Zen Spa & Wellness', service: 'Swedish Massage', date: 'May 27, 2025', time: '03:30 PM', status: 'cancelled' },
  { id: '6', ref: 'BK-2296', customer: 'Tina Robles', email: 'tina.robles@email.com', business: 'BrightSmile Dental', service: 'Teeth Cleaning', date: 'May 26, 2025', time: '09:00 AM', status: 'completed' },
  { id: '7', ref: 'BK-2295', customer: 'Mark Villanueva', email: 'mark.v@email.com', business: 'Prime Cuts Barbershop', service: 'Beard Trim', date: 'May 26, 2025', time: '01:00 PM', status: 'cancelled' },
  { id: '8', ref: 'BK-2294', customer: 'Joy Castillo', email: 'joy.c@email.com', business: 'Glow Studio', service: 'Keratin Treatment', date: 'May 26, 2025', time: '10:00 AM', status: 'confirmed' },
]

const statusVariant: Record<BookingStatus, 'success' | 'warning' | 'danger' | 'default'> = {
  confirmed: 'success',
  pending: 'warning',
  cancelled: 'danger',
  completed: 'default',
}

export default function AdminBookingsPage() {
  const counts = {
    total: bookings.length,
    confirmed: bookings.filter((b) => b.status === 'confirmed').length,
    pending: bookings.filter((b) => b.status === 'pending').length,
    cancelled: bookings.filter((b) => b.status === 'cancelled').length,
    completed: bookings.filter((b) => b.status === 'completed').length,
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Bookings</h1>
        <p className="text-sm text-slate-500 mt-1">Platform-wide booking activity</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {[
          { label: 'Total', value: counts.total, color: 'text-slate-900' },
          { label: 'Confirmed', value: counts.confirmed, color: 'text-green-600' },
          { label: 'Pending', value: counts.pending, color: 'text-amber-600' },
          { label: 'Completed', value: counts.completed, color: 'text-slate-600' },
          { label: 'Cancelled', value: counts.cancelled, color: 'text-red-500' },
        ].map((s) => (
          <Card key={s.label} className="p-4">
            <p className="text-xs text-slate-500">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Bookings</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {['Ref', 'Customer', 'Business', 'Service', 'Date & Time', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <code className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{booking.ref}</code>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-900">{booking.customer}</p>
                    <p className="text-xs text-slate-400">{booking.email}</p>
                  </td>
                  <td className="px-6 py-4 text-slate-700">{booking.business}</td>
                  <td className="px-6 py-4 text-slate-600">{booking.service}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-slate-800">{booking.date}</p>
                    <p className="text-xs text-slate-400">{booking.time}</p>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={statusVariant[booking.status]} className="capitalize">
                      {booking.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">View</button>
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
