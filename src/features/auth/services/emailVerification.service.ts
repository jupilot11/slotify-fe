import { invokeEdgeFunction } from '@/lib/supabase/invoke'
import type { EmailVerificationRequest, EmailVerificationResponse } from '@/types/auth'

export async function verifyEmail(payload: EmailVerificationRequest): Promise<EmailVerificationResponse> {
  return invokeEdgeFunction<EmailVerificationResponse>('verify-email', { body: payload })
}
