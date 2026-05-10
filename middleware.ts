import { NextRequest, NextResponse } from 'next/server'

/** Decode a JWT payload without signature verification (safe for expiry checks only) */
function getTokenExpiry(token: string): number {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString())
    return typeof payload.exp === 'number' ? payload.exp : 0
  } catch {
    return 0
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const accessToken = request.cookies.get('access_token')?.value
  const refreshToken = request.cookies.get('refresh_token')?.value

  const isProtected = pathname.startsWith('/dashboard')
  const isAuthPage = pathname === '/login'

  // No access token at all
  if (!accessToken) {
    if (isProtected) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return NextResponse.next()
  }

  // Access token exists — check if it's expired
  const exp = getTokenExpiry(accessToken)
  const isExpired = exp < Math.floor(Date.now() / 1000)

  if (isExpired) {
    if (!refreshToken) {
      // No way to refresh — clear stale cookies and redirect to login
      if (isProtected) {
        const response = NextResponse.redirect(new URL('/login', request.url))
        response.cookies.delete('access_token')
        response.cookies.delete('refresh_token')
        response.cookies.delete('user_profile')
        return response
      }
      return NextResponse.next()
    }

    // Refresh token available — hand off to the refresh route which will
    // fetch a new access token and redirect back to the original destination
    if (isProtected) {
      const refreshUrl = new URL('/api/auth/refresh', request.url)
      refreshUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(refreshUrl)
    }
  }

  // Valid, non-expired token — bounce authenticated users away from login
  if (isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
}
