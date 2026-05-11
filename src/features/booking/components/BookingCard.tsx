import type { Booking } from '@/types'
import { Card, CardContent } from '@/components/ui/Card'
import BookingStatusBadge from './BookingStatusBadge'
import { formatDate, formatTime } from '@/lib/utils'

interface BookingCardProps {
  booking: Booking
}

export default function BookingCard({ booking }: BookingCardProps) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-semibold text-slate-900 truncate">{booking.customerName}</p>
          <p className="text-sm text-slate-600 mt-0.5">{booking.serviceName}</p>
          <p className="text-xs text-slate-400 mt-1">
            {formatDate(booking.date)} · {formatTime(booking.time)}
          </p>
        </div>
        <BookingStatusBadge status={booking.status} />
      </CardContent>
    </Card>
  )
}
