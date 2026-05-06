import type { AuthError, AuthErrorCode } from '@/types/auth'

// ── User-facing messages (never expose raw server/DB errors) ─────────────────

const USER_MESSAGES: Record<AuthErrorCode, string> = {
  EMAIL_ALREADY_EXISTS: 'An account with this email already exists. Try signing in instead.',
  INVALID_EMAIL: 'The email address entered is not valid.',
  RATE_LIMITED: 'Too many attempts. Please wait a moment and try again.',
  NETWORK_ERROR: 'No internet connection. Please check your network and try again.',
  SERVER_ERROR: 'Something went wrong on our end. Please try again in a moment.',
  TIMEOUT: 'The request took too long. Please try again.',
  VALIDATION_ERROR: 'Please check your information and try again.',
  UNKNOWN: 'An unexpected error occurred. Please try again.',
}

// ── Extraction helpers ───────────────────────────────────────────────────────

function extractMessage(raw: unknown): string {
  if (raw instanceof Error) return raw.message
  if (typeof raw === 'object' && raw !== null) {
    const obj = raw as Record<string, unknown>
    return String(obj.message ?? obj.error ?? obj.msg ?? '')
  }
  return String(raw ?? '')
}

function extractStatus(raw: unknown): number {
  if (typeof raw === 'object' && raw !== null) {
    const obj = raw as Record<string, unknown>
    // FunctionsHttpError surfaces status inside `.context`
    if (typeof obj.context === 'object' && obj.context !== null) {
      const ctx = obj.context as Record<string, unknown>
      if (typeof ctx.status === 'number') return ctx.status
    }
    return Number(obj.status ?? obj.statusCode ?? 0)
  }
  return 0
}

// ── Classifier ───────────────────────────────────────────────────────────────

function classify(raw: unknown): AuthErrorCode {
  if (typeof window !== 'undefined' && !window.navigator.onLine) {
    return 'NETWORK_ERROR'
  }

  if (raw instanceof DOMException && raw.name === 'AbortError') {
    return 'TIMEOUT'
  }

  const msg = extractMessage(raw).toLowerCase()
  const status = extractStatus(raw)

  if (status === 429 || msg.includes('rate limit') || msg.includes('too many requests')) {
    return 'RATE_LIMITED'
  }
  if (
    status === 409 ||
    msg.includes('already registered') ||
    msg.includes('already exists') ||
    msg.includes('duplicate') ||
    msg.includes('email_exists') ||
    msg.includes('user already')
  ) {
    return 'EMAIL_ALREADY_EXISTS'
  }
  if (msg.includes('invalid email') || msg.includes('email format') || msg.includes('email is invalid')) {
    return 'INVALID_EMAIL'
  }
  // FunctionsFetchError / FunctionsRelayError — network-layer failures
  if (
    msg.includes('failed to send') ||
    msg.includes('relay error') ||
    msg.includes('failed to fetch') ||
    msg.includes('networkerror') ||
    msg.includes('load failed')
  ) {
    return 'NETWORK_ERROR'
  }
  if (status >= 500) {
    return 'SERVER_ERROR'
  }

  return 'UNKNOWN'
}

// ── Public API ───────────────────────────────────────────────────────────────

export function mapAuthError(error: unknown): AuthError {
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.error('[Auth Error]', error)
  }

  const code = classify(error)
  return { code, message: USER_MESSAGES[code] }
}
