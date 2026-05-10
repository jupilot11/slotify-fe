'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@/types'
import { getCurrentUser, logout as logoutService } from '@/services/auth.service'

interface AuthContextValue {
  user: User | null
  isLoading: boolean
  /** Call this after a successful login to sync the user into context */
  setUser: (user: User | null) => void
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Hydrate user state once on mount by reading the session cookie via /api/auth/me
  useEffect(() => {
    getCurrentUser()
      .then(({ data }) => setUser(data))
      .finally(() => setIsLoading(false))
  }, [])

  const logout = useCallback(async () => {
    await logoutService()
    setUser(null)
    router.push('/login')
  }, [router])

  return (
    <AuthContext.Provider value={{ user, isLoading, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
