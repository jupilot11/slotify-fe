import { invokeEdgeFunction } from '@/lib/supabase/invoke'
import type { ResendVerificationLinkRequest, ResendVerificationLinkResponse } from '@/types/auth'

export async function resendVerificationLink(
  payload: ResendVerificationLinkRequest,
): Promise<ResendVerificationLinkResponse> {
  return invokeEdgeFunction<ResendVerificationLinkResponse>('resend-verification-link', {
    body: payload,
  })
}
