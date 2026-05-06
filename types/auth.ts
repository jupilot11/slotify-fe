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

// ── Error classification ─────────────────────────────────────────────────────

export type AuthErrorCode =
  | 'EMAIL_ALREADY_EXISTS'
  | 'INVALID_EMAIL'
  | 'RATE_LIMITED'
  | 'NETWORK_ERROR'
  | 'SERVER_ERROR'
  | 'TIMEOUT'
  | 'VALIDATION_ERROR'
  | 'UNKNOWN'

export interface AuthError {
  code: AuthErrorCode
  message: string
}

// ── State ────────────────────────────────────────────────────────────────────

export type RegistrationStatus = 'idle' | 'loading' | 'success' | 'error'
