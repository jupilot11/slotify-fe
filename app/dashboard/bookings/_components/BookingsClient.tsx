'use client'

import { useState } from 'react'
import type { Booking, BookingStatus } from '@/types'
import BookingStatusBadge from '@/features/booking/components/BookingStatusBadge'
import Badge from '@/components/ui/Badge'
import EmptyState from '@/components/ui/EmptyState'
import { formatDate, formatTime } from '@/lib/utils'
import { updateBookingStatus } from '@/services/booking.service'

type FilterStatus = BookingStatus | 'all'

const STATUS_TABS: { label: string; value: FilterStatus }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
]

interface BookingsClientProps {
  initialBookings: Booking[]
}

export default function BookingsClient({ initialBookings }: BookingsClientProps) {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings)
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('all')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const filtered =
    activeFilter === 'all' ? bookings : bookings.filter((b) => b.status === activeFilter)

  const handleStatusUpdate = async (id: string, status: BookingStatus) => {
    setUpdatingId(id)
    const result = await updateBookingStatus(id, status)
    if (result.data) {
      setBookings((prev) => prev.map((b) => (b.id === id ? result.data! : b)))
    }
    setUpdatingId(null)
  }

  const counts: Record<FilterStatus, number> = {
    all: bookings.length,
    pending: bookings.filter((b) => b.status === 'pending').length,
    confirmed: bookings.filter((b) => b.status === 'confirmed').length,
    completed: bookings.filter((b) => b.status === 'completed').length,
    cancelled: bookings.filter((b) => b.status === 'cancelled').length,
  }

  return (
    <div>
      {/* Status tabs */}
      <div className="flex gap-1 mb-6 bg-slate-100 p-1 rounded-xl w-fit">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveFilter(tab.value)}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
              activeFilter === tab.value
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
            {counts[tab.value] > 0 && (
              <span
                className={`text-xs rounded-full px-1.5 py-0.5 font-semibold ${
                  activeFilter === tab.value
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {counts[tab.value]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Bookings table */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No bookings found"
          description={
            activeFilter === 'all'
              ? 'You have no bookings yet.'
              : `No ${activeFilter} bookings.`
          }
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Customer
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Service
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Date & Time
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Status
                </th>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((booking) => (
                <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3.5">
                    <p className="font-semibold text-slate-900">{booking.customerName}</p>
                    <p className="text-xs text-slate-400">{booking.customerEmail}</p>
                  </td>
                  <td className="px-4 py-3.5 text-slate-600">{booking.serviceName}</td>
                  <td className="px-4 py-3.5 text-slate-600">
                    <p>{formatDate(booking.date)}</p>
                    <p className="text-xs text-slate-400">{formatTime(booking.time)}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <BookingStatusBadge status={booking.status} />
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {booking.status === 'pending' && (
                        <button
                          onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                          disabled={updatingId === booking.id}
                          className="text-xs px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium transition-colors disabled:opacity-50"
                        >
                          Confirm
                        </button>
                      )}
                      {booking.status === 'confirmed' && (
                        <button
                          onClick={() => handleStatusUpdate(booking.id, 'completed')}
                          disabled={updatingId === booking.id}
                          className="text-xs px-2.5 py-1 rounded-md bg-green-50 text-green-700 hover:bg-green-100 font-medium transition-colors disabled:opacity-50"
                        >
                          Complete
                        </button>
                      )}
                      {(booking.status === 'pending' || booking.status === 'confirmed') && (
                        <button
                          onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                          disabled={updatingId === booking.id}
                          className="text-xs px-2.5 py-1 rounded-md bg-red-50 text-red-700 hover:bg-red-100 font-medium transition-colors disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
