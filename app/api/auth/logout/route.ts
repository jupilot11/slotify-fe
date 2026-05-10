import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.API_URL

const AUTH_COOKIES = ['access_token', 'refresh_token', 'user_profile'] as const

export async function POST(request: NextRequest) {
  const accessToken = request.cookies.get('access_token')?.value

  // Best-effort: tell the backend to invalidate the session.
  // We clear local cookies regardless of whether this call succeeds.
  if (accessToken) {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      })
    } catch {
      // Swallow — local logout still proceeds
    }
  }

  const response = NextResponse.json({ success: true })
  AUTH_COOKIES.forEach((name) => response.cookies.delete(name))
  return response
}
