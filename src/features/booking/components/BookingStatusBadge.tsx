import Badge from '@/components/ui/Badge'
import type { BookingStatus } from '@/types'

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'default'

const statusConfig: Record<BookingStatus, { label: string; variant: BadgeVariant }> = {
  pending: { label: 'Pending', variant: 'warning' },
  confirmed: { label: 'Confirmed', variant: 'info' },
  completed: { label: 'Completed', variant: 'success' },
  cancelled: { label: 'Cancelled', variant: 'danger' },
}

interface BookingStatusBadgeProps {
  status: BookingStatus
}

export default function BookingStatusBadge({ status }: BookingStatusBadgeProps) {
  const config = statusConfig[status]
  return <Badge variant={config.variant}>{config.label}</Badge>
}
