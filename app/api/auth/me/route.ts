import { NextRequest, NextResponse } from 'next/server'
import type { User } from '@/types'

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get('access_token')?.value

  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Read the profile that was cached at login time — avoids a backend round-trip
  // on every page load. The cookie shares the same maxAge as the access_token so
  // they expire together.
  const profileCookie = request.cookies.get('user_profile')?.value
  if (profileCookie) {
    try {
      const profile: User = JSON.parse(profileCookie)
      return NextResponse.json({ success: true, profile })
    } catch {
      // Malformed cookie — fall through and return unauthorized
    }
  }

  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
