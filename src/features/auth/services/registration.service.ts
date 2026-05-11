import { invokeEdgeFunction } from '@/lib/supabase/invoke'
import type { RegistrationRequest, RegistrationResponse } from '@/types/auth'

export async function registerUser(payload: RegistrationRequest): Promise<RegistrationResponse> {
  return invokeEdgeFunction<RegistrationResponse>('user-registration', { body: payload })
}
