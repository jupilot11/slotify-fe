import { supabase } from '@/lib/supabase'
import type { RegistrationRequest, RegistrationResponse } from '@/types/auth'

const FUNCTION_NAME = 'user-registration'
const TIMEOUT_MS = 15_000

/**
 * Invokes the `user-registration` Supabase Edge Function.
 * Throws on network failure, Edge Function error, or timeout.
 * The caller (hook layer) is responsible for mapping the error.
 */
export async function registerUser(payload: RegistrationRequest): Promise<RegistrationResponse> {
  // Race the invoke against a hard timeout so the UI never hangs indefinitely.
  const invoke = supabase.functions.invoke<RegistrationResponse>(FUNCTION_NAME, { body: payload })
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
  if (!data) throw new Error('Empty response from registration service')

  return data
}
