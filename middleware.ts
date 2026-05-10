import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Auth middleware using @supabase/ssr.
 *
 * Responsibilities:
 *  1. Refresh the Supabase session cookie on every request so it never
 *     silently expires mid-session.
 *  2. Redirect unauthenticated users away from /dashboard.
 *  3. Redirect authenticated users away from /login.
 *
 * Important: keep the createServerClient call and supabase.auth.getUser()
 * call consecutive — inserting logic between them can cause subtle
 * session-refresh bugs (per Supabase docs).
 */
export async function middleware(request: NextRequest) {
  // Start with a plain "pass-through" response. The Supabase client may
  // replace this below when it needs to write refreshed session cookies.
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
          // Forward the updated cookies onto both the request (for downstream
          // middleware) and the response (to be sent back to the browser).
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // getUser() validates the JWT with Supabase servers — do not use
  // getSession() here as it only reads from the cookie without verifying.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  if (!user && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match /dashboard and all its sub-routes, plus /login.
     * Exclude Next.js internals and static files.
     */
    '/dashboard/:path*',
    '/login',
  ],
}
