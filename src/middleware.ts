import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const SESSION_MAX_AGE_MS = 86_400_000 // 24 hours

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  const isProtected = pathname.startsWith('/dashboard') || pathname.startsWith('/admin') || pathname === '/login'

  if (!user && (pathname.startsWith('/dashboard') || pathname.startsWith('/admin'))) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user && (pathname.startsWith('/dashboard') || pathname.startsWith('/admin'))) {
    const sessionStartVal = request.cookies.get('slotify_session_start')?.value
    const sessionStart = sessionStartVal ? parseInt(sessionStartVal, 10) : NaN

    if (isNaN(sessionStart) || Date.now() - sessionStart >= SESSION_MAX_AGE_MS) {
      try { await supabase.auth.signOut() } catch { /* ignore */ }

      const expiredUrl = new URL('/login', request.url)
      expiredUrl.searchParams.set('expired', 'true')
      const expiredResponse = NextResponse.redirect(expiredUrl)

      for (const cookie of response.cookies.getAll()) {
        expiredResponse.cookies.set(cookie.name, cookie.value, {
          path: cookie.path,
          maxAge: cookie.maxAge,
          httpOnly: cookie.httpOnly,
          secure: cookie.secure,
          sameSite: cookie.sameSite as 'lax' | 'strict' | 'none' | undefined,
        })
      }
      expiredResponse.cookies.set('slotify_session_start', '', { path: '/', maxAge: 0, sameSite: 'lax' })
      return expiredResponse
    }
  }

  if (user && isProtected) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('roles')
      .eq('id', user.id)
      .maybeSingle()

    const roles = Array.isArray(profile?.roles) ? (profile.roles as string[]) : []
    const isAdmin = roles.includes('admin')

    if (pathname === '/login') {
      return NextResponse.redirect(new URL(isAdmin ? '/admin' : '/dashboard', request.url))
    }

    if (isAdmin && pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }

    if (!isAdmin && pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/login'],
}
