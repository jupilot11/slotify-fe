import type { User, ApiResponse } from '@/types'

export async function login(email: string, password: string): Promise<ApiResponse<User>> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  const data = await res.json()

  if (!res.ok) {
    return { data: null, error: data.error ?? 'Login failed' }
  }

  return { data: data.profile as User, error: null }
}

export async function logout(): Promise<void> {
  await fetch('/api/auth/logout', { method: 'POST' })
}

export async function getCurrentUser(): Promise<ApiResponse<User>> {
  const res = await fetch('/api/auth/me')

  if (!res.ok) {
    return { data: null, error: 'Not authenticated' }
  }

  const data = await res.json()
  return { data: data.profile as User, error: null }
}
