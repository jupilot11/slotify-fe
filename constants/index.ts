import type { BookingStatus, SelectOption } from '@/types'

export const BUSINESS_CATEGORIES: SelectOption[] = [
  { label: 'Barbershop', value: 'barbershop' },
  { label: 'Clinic', value: 'clinic' },
  { label: 'Salon', value: 'salon' },
  { label: 'Other', value: 'other' },
]

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export const DAYS_OF_WEEK = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const

export const DEFAULT_BUSINESS_ID = 'biz_1'
