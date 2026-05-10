// ── Request / Response ──────────────────────────────────────────────────────

export interface RegistrationRequest {
  email: string
  full_name: string
  contact_number: string
  /** Window origin sent so the Edge Function can build email confirm links. */
  site_url: string
}

export interface RegistrationResponse {
  message?: string
  user?: {
    id: string
    email: string
  }
}

// ── Error ────────────────────────────────────────────────────────────────────

export interface AuthError {
  success?: boolean
  message: string
}

// ── Email Verification ───────────────────────────────────────────────────────

export interface EmailVerificationRequest {
  email: string
}

export interface EmailVerificationResponse {
  success: boolean
  message?: string
  email_verified?: boolean
  password_set?: boolean
}

// ── Email Verification Callback ──────────────────────────────────────────────

export interface EmailVerificationCallbackResponse {
  success: boolean
  message?: string
  error?: string
  code?: string
  data?: {
    email_verified: boolean
  }
}

// ── Set Password ─────────────────────────────────────────────────────────────

export interface SetPasswordRequest {
  email: string
  newPassword: string
}

export interface SetPasswordResponse {
  success: boolean
  message?: string
  error?: string
  code?: string
}

// ── State ────────────────────────────────────────────────────────────────────

// ── Login ────────────────────────────────────────────────────────────────────

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

// ── State ────────────────────────────────────────────────────────────────────

export type RegistrationStatus = 'idle' | 'loading' | 'success' | 'error'
export type EmailVerificationStatus = 'idle' | 'loading' | 'success' | 'error'
export type SetPasswordStatus = 'idle' | 'loading' | 'success' | 'error'
