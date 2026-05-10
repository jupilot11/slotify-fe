import type { AuthError } from '@/types/auth'

function extractMessage(raw: unknown): string {
  if (raw instanceof Error) return raw.message
  if (typeof raw === 'object' && raw !== null) {
    const obj = raw as Record<string, unknown>
    return String(obj.message ?? obj.error ?? obj.msg ?? 'An unexpected error occurred.')
  }
  return String(raw ?? 'An unexpected error occurred.')
}

export function mapAuthError(error: unknown): AuthError {
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    // console.error('[Auth Error]', error)
  }
  return { message: extractMessage(error) }
}
