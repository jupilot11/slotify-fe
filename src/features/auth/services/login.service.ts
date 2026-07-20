import { invokeEdgeFunction } from '@/lib/supabase/invoke'
import { createClient } from '@/lib/supabase/client'
import type { LoginRequest, LoginResponse } from '@/types/auth'

export async function loginUser(payload: LoginRequest): Promise<LoginResponse> {
  const data = await invokeEdgeFunction<LoginResponse>('user-login', { body: payload })

  const supabase = createClient()
  const { error: sessionError } = await supabase.auth.setSession({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
  })
  if (sessionError) throw sessionError

  document.cookie = `slotify_session_start=${Date.now()}; path=/; max-age=86400; SameSite=Lax`

  return data
}
