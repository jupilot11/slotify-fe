'use client'

import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

interface UseUserReturn {
  user: User | null
  isLoading: boolean
}

/**
 * Returns the currently authenticated Supabase user and a loading flag.
 *
 * - Uses getUser() on mount (validates the JWT server-side, most secure).
 * - Subscribes to onAuthStateChange so the value stays in sync after
 *   login / logout without a page reload.
 */
export function useUser(): UseUserReturn {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    // Initial fetch — treat any error (e.g. invalid refresh token) as signed-out
    supabase.auth.getUser()
      .then(({ data }) => { setUser(data.user) })
      .catch(() => { setUser(null) })
      .finally(() => { setIsLoading(false) })

    // Keep in sync with auth events (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  return { user, isLoading }
}
