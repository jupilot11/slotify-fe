import { createClient } from '@/lib/supabase/client'
import { markEmailVerified } from './emailVerificationCallback.service'

interface HandleAuthCallbackParams {
  accessToken: string
  refreshToken: string
  type: string | null
}

interface HandleAuthCallbackResult {
  success: boolean
  error?: string
  redirectTo?: string
}

export async function handleAuthCallback({
  accessToken,
  refreshToken,
  type,
}: HandleAuthCallbackParams): Promise<HandleAuthCallbackResult> {
  const supabase = createClient()

  const { error: sessionError } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  })

  if (sessionError) {
    return { success: false, error: 'Invalid or expired verification link. Please request a new one.' }
  }

  if (type === 'recovery') {
    return { success: true, redirectTo: '/auth/reset-password' }
  }

  if (type === 'signup') {
    try {
      await markEmailVerified(accessToken)
    } catch {
      // Non-fatal: session is established; profile update can be retried
    }
  }

  await supabase.auth.signOut()
  return { success: true }
}
