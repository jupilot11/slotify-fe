import { NextRequest, NextResponse } from 'next/server'
import type { User, Session } from '@/types'

const API_URL = process.env.API_URL

interface BackendLoginResponse {
  success: boolean
  message: string
  profile: User
  session: Session
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const data: BackendLoginResponse = await res.json()

    if (!res.ok || !data.success) {
      return NextResponse.json(
        { error: data.message ?? 'Login failed' },
        { status: res.status || 400 },
      )
    }

    const { session, profile } = data
    const now = Math.floor(Date.now() / 1000)

    const cookieBase = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
    }

    const response = NextResponse.json({ success: true, profile })

    // Short-lived access token — expires when the JWT expires
    response.cookies.set('access_token', session.access_token, {
      ...cookieBase,
      maxAge: session.expires_at - now,
    })

    // Long-lived refresh token — 30 days
    response.cookies.set('refresh_token', session.refresh_token, {
      ...cookieBase,
      maxAge: 60 * 60 * 24 * 30,
    })

    // Profile cached in a cookie so /api/auth/me avoids an extra backend round-trip
    response.cookies.set('user_profile', JSON.stringify(profile), {
      ...cookieBase,
      maxAge: session.expires_at - now,
    })

    return response
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
