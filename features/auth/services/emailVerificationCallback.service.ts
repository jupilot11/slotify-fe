import { supabase } from '@/lib/supabase'
import type { EmailVerificationCallbackResponse } from '@/types/auth'

const FUNCTION_NAME = 'email-verification-callback'
const TIMEOUT_MS = 15_000

export async function markEmailVerified(accessToken: string): Promise<EmailVerificationCallbackResponse> {
  const invoke = supabase.functions.invoke<EmailVerificationCallbackResponse>(FUNCTION_NAME, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new DOMException('Request timed out', 'AbortError')), TIMEOUT_MS),
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
  if (!data) throw new Error('Empty response from email verification callback service')

  return data
}
