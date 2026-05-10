import { NextRequest, NextResponse } from 'next/server'
import type { Session } from '@/types'

const API_URL = process.env.API_URL

interface BackendRefreshResponse {
  success: boolean
  message?: string
  session: Session
}

/**
 * GET /api/auth/refresh?redirect=<path>
 *
 * Called by middleware when the access_token is expired but a refresh_token
 * is still present. Fetches a new session from the backend, updates cookies,
 * then redirects back to the originally requested path.
 */
export async function GET(request: NextRequest) {
  const refreshToken = request.cookies.get('refresh_token')?.value
  const redirect = request.nextUrl.searchParams.get('redirect') ?? '/dashboard'

  const loginUrl = new URL('/login', request.url)

  if (!refreshToken) {
    return NextResponse.redirect(loginUrl)
  }

  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    })

    const data: BackendRefreshResponse = await res.json()

    if (!res.ok || !data.success) {
      // Refresh token is no longer valid — force re-login
      const response = NextResponse.redirect(loginUrl)
      ;['access_token', 'refresh_token', 'user_profile'].forEach((name) =>
        response.cookies.delete(name),
      )
      return response
    }

    const { session } = data
    const now = Math.floor(Date.now() / 1000)
    const cookieBase = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
    }

    const response = NextResponse.redirect(new URL(redirect, request.url))

    response.cookies.set('access_token', session.access_token, {
      ...cookieBase,
      maxAge: session.expires_at - now,
    })

    // Backend may issue a rotated refresh token — update if provided
    if (session.refresh_token) {
      response.cookies.set('refresh_token', session.refresh_token, {
        ...cookieBase,
        maxAge: 60 * 60 * 24 * 30,
      })
    }

    return response
  } catch {
    return NextResponse.redirect(loginUrl)
  }
}
