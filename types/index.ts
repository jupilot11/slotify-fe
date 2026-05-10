export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'
export type ServiceStatus = 'active' | 'inactive'
export type BusinessCategory = 'barbershop' | 'clinic' | 'salon' | 'other'

/** Shape mirrors the `profile` object returned by the backend login/me endpoints */
export interface User {
  id: string
  email: string
  full_name: string
  roles: string[]
  contact_number?: string | null
  email_verified: boolean
  password_set: boolean
  created_at: string
  updated_at: string
}

/** Raw session payload returned by the backend */
export interface Session {
  access_token: string
  refresh_token: string
  expires_at: number
  token_type: string
}

export interface WorkingHours {
  [day: string]: { open: string; close: string; closed: boolean }
}

export interface Business {
  id: string
  name: string
  slug: string
  description?: string
  category: BusinessCategory
  logoUrl?: string
  ownerId: string
  isActive: boolean
  phone?: string
  address?: string
  workingHours?: WorkingHours
}

export interface Service {
  id: string
  businessId: string
  name: string
  description?: string
  duration: number
  price: number
  status: ServiceStatus
}

export interface Booking {
  id: string
  businessId: string
  serviceId: string
  serviceName: string
  customerId?: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  date: string
  time: string
  status: BookingStatus
  notes?: string
  createdAt: string
}

export interface TimeSlot {
  time: string
  available: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

export interface ApiResponse<T> {
  data: T | null
  error: string | null
}

export type SelectOption = {
  label: string
  value: string
}
