import { createBrowserClient } from '@supabase/ssr'

/**
 * Browser-side Supabase client.
 * Uses @supabase/ssr so the session is stored in cookies instead of
 * localStorage — this makes it readable by middleware and Server Components.
 *
 * Call this inside Client Components ('use client').
 * It returns the same singleton-like instance on every call thanks to
 * the internal memoisation inside createBrowserClient.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
