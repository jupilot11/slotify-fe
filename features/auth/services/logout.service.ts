import { createClient } from '@/lib/supabase/client'

export async function logoutUser(): Promise<void> {
  const supabase = createClient()
  // Supabase clears local session cookies even when server revocation fails
  // (e.g. invalid/expired refresh token), so never throw here.
  await supabase.auth.signOut()
}
