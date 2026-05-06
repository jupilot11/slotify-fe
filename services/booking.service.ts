import type { Booking, BookingStatus, PaginatedResponse, ApiResponse } from '@/types'
import { mockBookings } from '@/mock/bookings'

let bookingsStore = [...mockBookings]

const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms))

export async function getBookings(
  businessId: string,
  filters?: { status?: BookingStatus; date?: string }
): Promise<PaginatedResponse<Booking>> {
  await delay()
  let results = bookingsStore.filter((b) => b.businessId === businessId)
  if (filters?.status) results = results.filter((b) => b.status === filters.status)
  if (filters?.date) results = results.filter((b) => b.date === filters.date)
  results = results.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
  return { data: results, total: results.length, page: 1, limit: 50 }
}

export async function getBookingById(id: string): Promise<ApiResponse<Booking>> {
  await delay()
  const booking = bookingsStore.find((b) => b.id === id)
  return { data: booking ?? null, error: booking ? null : 'Booking not found' }
}

export async function updateBookingStatus(
  id: string,
  status: BookingStatus
): Promise<ApiResponse<Booking>> {
  await delay()
  const index = bookingsStore.findIndex((b) => b.id === id)
  if (index === -1) return { data: null, error: 'Booking not found' }
  bookingsStore[index] = { ...bookingsStore[index], status }
  return { data: bookingsStore[index], error: null }
}

export async function createBooking(
  data: Omit<Booking, 'id' | 'createdAt'>
): Promise<ApiResponse<Booking>> {
  await delay()
  const booking: Booking = {
    ...data,
    id: `book_${Date.now()}`,
    createdAt: new Date().toISOString(),
  }
  bookingsStore.push(booking)
  return { data: booking, error: null }
}

export async function getAvailableSlots(
  businessId: string,
  _serviceId: string,
  date: string
): Promise<string[]> {
  await delay()
  const booked = bookingsStore
    .filter((b) => b.businessId === businessId && b.date === date && b.status !== 'cancelled')
    .map((b) => b.time)
  const allSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  ]
  return allSlots.filter((slot) => !booked.includes(slot))
}
