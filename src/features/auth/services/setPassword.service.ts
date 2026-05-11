import { invokeEdgeFunction } from '@/lib/supabase/invoke'
import type { SetPasswordRequest, SetPasswordResponse } from '@/types/auth'

export async function setPassword(payload: SetPasswordRequest): Promise<SetPasswordResponse> {
  return invokeEdgeFunction<SetPasswordResponse>('set-user-password', { body: payload })
}
