import type { User, ApiResponse } from '@/types'
import { mockUsers, mockCurrentUser } from '@/mock/users'

const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms))

export async function login(email: string, _password: string): Promise<ApiResponse<User>> {
  await delay()
  const user = mockUsers.find((u) => u.email === email)
  if (!user) return { data: null, error: 'Invalid email or password' }
  return { data: user, error: null }
}

export async function signUp(data: {
  fullName: string
  mobileNumber: string
  email: string
}): Promise<ApiResponse<User>> {
  await delay()
  const existing = mockUsers.find((u) => u.email === data.email)
  if (existing) return { data: null, error: 'An account with this email already exists' }
  const newUser: User = {
    id: `user_${Date.now()}`,
    email: data.email,
    name: data.fullName,
    role: 'owner',
  }
  return { data: newUser, error: null }
}

export async function logout(): Promise<void> {
  await delay(200)
}

export async function getCurrentUser(): Promise<ApiResponse<User>> {
  await delay(200)
  return { data: mockCurrentUser, error: null }
}
