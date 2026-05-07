import { supabase } from '@/lib/supabase'
import type { EmailVerificationRequest, EmailVerificationResponse } from '@/types/auth'

const FUNCTION_NAME = 'verify-email'
const TIMEOUT_MS = 15_000

export async function verifyEmail(payload: EmailVerificationRequest): Promise<EmailVerificationResponse> {
  const invoke = supabase.functions.invoke<EmailVerificationResponse>(FUNCTION_NAME, { body: payload })
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new DOMException('Request timed out', 'AbortError')), TIMEOUT_MS)
  )

  const { data, error } = await Promise.race([invoke, timeout])

  if (error) {
    const ctx = (error as unknown as { context?: unknown }).context
    if (ctx instanceof Response) {
      const body = await ctx.json().catch(() => null)
      const msg = body?.error ?? body?.message
      if (typeof msg === 'string' && msg) throw new Error(msg)
    }
    throw error
  }
  if (!data) throw new Error('Empty response from email verification service')

  return data
}
