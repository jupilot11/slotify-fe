import { invokeEdgeFunction } from '@/lib/supabase/invoke'
import type { ForgotPasswordRequest, ForgotPasswordResponse } from '@/types/auth'

export async function forgotPassword(
  payload: ForgotPasswordRequest,
): Promise<ForgotPasswordResponse> {
  return invokeEdgeFunction<ForgotPasswordResponse>('send-password-reset', { body: payload })
}
