import type { Metadata } from 'next'
import TopBar from '@/components/layout/TopBar'
import { getBookings } from '@/services/booking.service'
import { DEFAULT_BUSINESS_ID } from '@/constants'
import BookingsClient from './_components/BookingsClient'

export const metadata: Metadata = { title: 'Bookings – Slotify' }

export default async function BookingsPage() {
  const result = await getBookings(DEFAULT_BUSINESS_ID)

  return (
    <div>
      <TopBar title="Bookings" subtitle="Manage all your appointments" />
      <div className="p-6">
        <BookingsClient initialBookings={result.data} />
      </div>
    </div>
  )
}
