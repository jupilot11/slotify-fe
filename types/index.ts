export type UserRole = 'owner' | 'staff' | 'admin'
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'
export type ServiceStatus = 'active' | 'inactive'
export type BusinessCategory = 'barbershop' | 'clinic' | 'salon' | 'other'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatarUrl?: string
  businessId?: string
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
