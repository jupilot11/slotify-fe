import { invokeEdgeFunction } from '@/lib/supabase/invoke'
import type { EmailVerificationCallbackResponse } from '@/types/auth'

export async function markEmailVerified(accessToken: string): Promise<EmailVerificationCallbackResponse> {
  return invokeEdgeFunction<EmailVerificationCallbackResponse>('email-verification-callback', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
}
