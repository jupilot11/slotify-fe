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
  success: boolean,
  message?: string,
  password_set?: boolean

}

// ── State ────────────────────────────────────────────────────────────────────

export type RegistrationStatus = 'idle' | 'loading' | 'success' | 'error'
export type EmailVerificationStatus = 'idle' | 'loading' | 'success' | 'error'
