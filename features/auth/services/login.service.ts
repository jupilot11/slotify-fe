import { createClient } from '@/lib/supabase/client'
import type { LoginRequest, LoginResponse } from '@/types/auth'

const FUNCTION_NAME = 'user-login'
const TIMEOUT_MS = 15_000

export async function loginUser(payload: LoginRequest): Promise<LoginResponse> {
  const supabase = createClient()

  const invoke = supabase.functions.invoke<LoginResponse>(FUNCTION_NAME, { body: payload })
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
  if (!data) throw new Error('Empty response from login service')

  // Restore the session returned by the edge function into the browser Supabase
  // client. Because we use @supabase/ssr's createBrowserClient the session is
  // persisted in cookies (not localStorage), so middleware and Server
  // Components can read it immediately on the next request.
  const { error: sessionError } = await supabase.auth.setSession({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
  })
  if (sessionError) throw sessionError

  return data
}
