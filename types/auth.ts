// ── Request / Response ──────────────────────────────────────────────────────

export interface LoginRequest {
  email: string
  password: string
}

export type UserRole = 'customer' | 'client' | 'admin' | 'staff' | 'manager' | 'owner'

export interface UserProfile {
  id: string
  email: string | null
  full_name: string | null
  created_at: string
  updated_at: string
  roles: UserRole[]
  contact_number: string | null
  email_verified: boolean
  password_set: boolean | null
  verification_token: string | null
  token_expires_at: string | null
}

export interface LoginResponse {
  message: string
  user: {
    id: string
    email: string
    created_at: string
    last_sign_in_at: string
  }
  session: {
    access_token: string
    refresh_token: string
    expires_at: number
    token_type: string
  }
  profile?: UserProfile
  profile_warning?: string
}

// ── Error ────────────────────────────────────────────────────────────────────

export interface AuthError {
  success?: boolean
  message: string
}
