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

  return data
}
