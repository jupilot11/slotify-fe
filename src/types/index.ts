export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'
export type ServiceStatus = 'active' | 'inactive'
export type BusinessCategory = 'barbershop' | 'clinic' | 'salon' | 'other'

// Auth-specific types live in @/types/auth — import from there when you need
// UserProfile, LoginRequest, LoginResponse, etc.

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

export interface BusinessSummary {
  id: string
  name: string
  slug: string
  city: string | null
  status: string
  logo_url: string | null
  category_id: string | null
  business_categories: { name: string } | null
}
