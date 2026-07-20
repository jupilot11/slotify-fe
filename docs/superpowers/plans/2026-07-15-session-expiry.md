# Session Expiry Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enforce a hard 24-hour session limit per browser with a blocking countdown modal 5 minutes before expiry and a forced logout at the 24-hour mark.

**Architecture:** A `slotify_session_start` plain cookie is set on login and read by both the middleware (server enforcement) and a `useSessionExpiry` hook (client-side countdown). The middleware signs out and redirects to `/login?expired=true` if the session is too old; the hook drives a blocking `SessionExpiryModal` in `DashboardShell` and auto-logs out at zero.

**Tech Stack:** Next.js 16 App Router, `@supabase/ssr`, Tailwind CSS, TypeScript

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `src/features/auth/services/login.service.ts` | Modify | Set `slotify_session_start` cookie after session is established |
| `src/features/auth/services/logout.service.ts` | Modify | Clear `slotify_session_start` cookie on sign-out |
| `src/middleware.ts` | Modify | Reject requests where session age ≥ 24 h |
| `src/hooks/useSessionExpiry.ts` | Create | Read cookie, schedule warning modal and auto-logout |
| `src/features/auth/components/SessionExpiryModal.tsx` | Create | Blocking countdown modal with "Log out now" button |
| `src/components/layout/DashboardShell.tsx` | Modify | Mount hook + modal |
| `src/app/login/LoginPageClient.tsx` | Modify | Show "session expired" notice from `?expired=true` param |
| `src/app/login/page.tsx` | Modify | Wrap `LoginPageClient` in `<Suspense>` (required for `useSearchParams`) |

---

## Task 1: Set `slotify_session_start` cookie on login

**Files:**
- Modify: `src/features/auth/services/login.service.ts`

- [ ] **Step 1: Replace the file with this content**

```ts
import { invokeEdgeFunction } from '@/lib/supabase/invoke'
import { createClient } from '@/lib/supabase/client'
import type { LoginRequest, LoginResponse } from '@/types/auth'

export async function loginUser(payload: LoginRequest): Promise<LoginResponse> {
  const data = await invokeEdgeFunction<LoginResponse>('user-login', { body: payload })

  const supabase = createClient()
  const { error: sessionError } = await supabase.auth.setSession({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
  })
  if (sessionError) throw sessionError

  document.cookie = `slotify_session_start=${Date.now()}; path=/; max-age=86400; SameSite=Lax`

  return data
}
```

- [ ] **Step 2: Manually verify**

Run `npm run dev` from `fe/`, log in, then open DevTools → Application → Cookies. Confirm `slotify_session_start` exists with a Unix ms timestamp as its value and a 24 h expiry.

- [ ] **Step 3: Commit**

```bash
git add fe/src/features/auth/services/login.service.ts
git commit -m "feat(session): stamp slotify_session_start cookie on login"
```

---

## Task 2: Clear `slotify_session_start` cookie on logout

**Files:**
- Modify: `src/features/auth/services/logout.service.ts`

- [ ] **Step 1: Replace the file with this content**

```ts
import { createClient } from '@/lib/supabase/client'

export async function logoutUser(): Promise<void> {
  const supabase = createClient()
  await supabase.auth.signOut()
  document.cookie = 'slotify_session_start=; path=/; max-age=0; SameSite=Lax'
}
```

- [ ] **Step 2: Manually verify**

With the dev server running, log in then log out. Open DevTools → Application → Cookies. Confirm `slotify_session_start` is gone after logout.

- [ ] **Step 3: Commit**

```bash
git add fe/src/features/auth/services/logout.service.ts
git commit -m "feat(session): clear slotify_session_start cookie on logout"
```

---

## Task 3: Enforce session age in middleware

**Files:**
- Modify: `src/middleware.ts`

- [ ] **Step 1: Replace the file with this content**

```ts
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
```

- [ ] **Step 2: Manually verify**

To simulate an expired session without waiting 24 hours: log in, then in DevTools → Application → Cookies, change `slotify_session_start` to `1` (a timestamp from 1970). Navigate to `/dashboard`. You should be redirected to `/login?expired=true`.

- [ ] **Step 3: Commit**

```bash
git add fe/src/middleware.ts
git commit -m "feat(session): reject sessions older than 24h in middleware"
```

---

## Task 4: Create `useSessionExpiry` hook

**Files:**
- Create: `src/hooks/useSessionExpiry.ts`

- [ ] **Step 1: Create the file with this content**

```ts
'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { logoutUser } from '@/features/auth/services/logout.service'

const SESSION_DURATION_MS = 86_400_000
const WARNING_BEFORE_MS = 300_000 // 5 minutes

function readSessionStart(): number | null {
  const entry = document.cookie
    .split('; ')
    .find((row) => row.startsWith('slotify_session_start='))
  if (!entry) return null
  const val = parseInt(entry.split('=')[1], 10)
  return isNaN(val) ? null : val
}

interface UseSessionExpiryReturn {
  showWarning: boolean
  secondsRemaining: number
}

export function useSessionExpiry(): UseSessionExpiryReturn {
  const router = useRouter()
  const [showWarning, setShowWarning] = useState(false)
  const [secondsRemaining, setSecondsRemaining] = useState(300)
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startCountdown = useCallback((initialSeconds: number) => {
    setSecondsRemaining(initialSeconds)
    setShowWarning(true)
    countdownRef.current = setInterval(() => {
      setSecondsRemaining((s) => {
        if (s <= 1) {
          clearInterval(countdownRef.current!)
          return 0
        }
        return s - 1
      })
    }, 1000)
  }, [])

  const handleExpiry = useCallback(async () => {
    if (countdownRef.current) clearInterval(countdownRef.current)
    await logoutUser()
    router.push('/login?expired=true')
  }, [router])

  useEffect(() => {
    const sessionStart = readSessionStart()
    if (!sessionStart) return

    const elapsed = Date.now() - sessionStart
    const timeRemaining = SESSION_DURATION_MS - elapsed

    if (timeRemaining <= 0) {
      handleExpiry()
      return
    }

    const warningDelay = timeRemaining - WARNING_BEFORE_MS
    let warningTimeout: ReturnType<typeof setTimeout>
    const expiryTimeout = setTimeout(handleExpiry, timeRemaining)

    if (warningDelay <= 0) {
      startCountdown(Math.ceil(timeRemaining / 1000))
    } else {
      warningTimeout = setTimeout(() => {
        startCountdown(300)
      }, warningDelay)
    }

    return () => {
      clearTimeout(warningTimeout!)
      clearTimeout(expiryTimeout)
      if (countdownRef.current) clearInterval(countdownRef.current)
    }
  }, [handleExpiry, startCountdown])

  return { showWarning, secondsRemaining }
}
```

- [ ] **Step 2: Manually verify**

To test without waiting: temporarily change `WARNING_BEFORE_MS` to `60_000` (1 minute) and `SESSION_DURATION_MS` to `90_000` (90 seconds), then set `slotify_session_start` cookie to `Date.now() - 30_000` (30 seconds ago). After 60 seconds the modal should appear; after 90 seconds from the original cookie value you should be redirected. Revert the constants after verifying.

- [ ] **Step 3: Commit**

```bash
git add fe/src/hooks/useSessionExpiry.ts
git commit -m "feat(session): add useSessionExpiry hook for countdown and auto-logout"
```

---

## Task 5: Create `SessionExpiryModal` component

**Files:**
- Create: `src/features/auth/components/SessionExpiryModal.tsx`

- [ ] **Step 1: Create the file with this content**

```tsx
'use client'

import { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import { logoutUser } from '@/features/auth/services/logout.service'

interface SessionExpiryModalProps {
  isOpen: boolean
  secondsRemaining: number
}

function formatCountdown(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function SessionExpiryModal({ isOpen, secondsRemaining }: SessionExpiryModalProps) {
  const router = useRouter()

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const handleLogoutNow = useCallback(async () => {
    await logoutUser()
    router.push('/login')
  }, [router])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" aria-modal="true" role="alertdialog">
      <div className="absolute inset-0 bg-black/50" aria-hidden="true" />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-8 text-center">
        <div className="mb-4 flex justify-center">
          <div className="rounded-full bg-amber-100 p-3">
            <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
            </svg>
          </div>
        </div>
        <h2 className="text-lg font-semibold text-slate-900 mb-2">Session Expiring</h2>
        <p className="text-sm text-slate-500 mb-3">For your security, you will be logged out in</p>
        <p className="text-4xl font-bold text-slate-900 mb-6 tabular-nums">{formatCountdown(secondsRemaining)}</p>
        <Button variant="danger" size="lg" className="w-full" onClick={handleLogoutNow}>
          Log out now
        </Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Manually verify**

With the dev server running, temporarily import and render `<SessionExpiryModal isOpen={true} secondsRemaining={42} />` directly in any page to confirm the modal renders correctly and the countdown displays as `0:42`. Remove the test render after verifying.

- [ ] **Step 3: Commit**

```bash
git add fe/src/features/auth/components/SessionExpiryModal.tsx
git commit -m "feat(session): add SessionExpiryModal blocking countdown component"
```

---

## Task 6: Mount hook + modal in `DashboardShell`

**Files:**
- Modify: `src/components/layout/DashboardShell.tsx`

- [ ] **Step 1: Replace the file with this content**

```tsx
'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'
import DashboardNavbar from './DashboardNavbar'
import type { ReactNode } from 'react'
import { useSessionExpiry } from '@/hooks/useSessionExpiry'
import SessionExpiryModal from '@/features/auth/components/SessionExpiryModal'

interface DashboardShellProps {
  children: ReactNode
}

export default function DashboardShell({ children }: DashboardShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const pathname = usePathname()
  const isHub = pathname === '/dashboard'
  const { showWarning, secondsRemaining } = useSessionExpiry()

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50">
      <DashboardNavbar onMenuClick={isHub ? undefined : () => setIsSidebarOpen(true)} />
      <div className="relative flex flex-1 overflow-hidden">
        {!isHub && (
          <>
            {isSidebarOpen && (
              <div
                className="fixed inset-0 z-20 bg-black/40 lg:hidden animate-overlay-show"
                onClick={() => setIsSidebarOpen(false)}
                aria-hidden="true"
              />
            )}
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
          </>
        )}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
      <SessionExpiryModal isOpen={showWarning} secondsRemaining={secondsRemaining} />
    </div>
  )
}
```

- [ ] **Step 2: Manually verify**

Navigate to `/dashboard` while logged in. Open DevTools → Console. Confirm no errors on mount. The modal should not appear (session is fresh). To force the modal, temporarily set the cookie to a value 23h55m in the past: in DevTools console run `document.cookie = 'slotify_session_start=' + (Date.now() - 86100000) + '; path=/'` then refresh — the modal should appear immediately.

- [ ] **Step 3: Commit**

```bash
git add fe/src/components/layout/DashboardShell.tsx
git commit -m "feat(session): mount session expiry hook and modal in DashboardShell"
```

---

## Task 7: Show expired notice on login page

`useSearchParams()` in Next.js App Router requires a `<Suspense>` boundary around the component that calls it, or the build will throw. `LoginPageClient` becomes the inner component; `page.tsx` wraps it.

**Files:**
- Modify: `src/app/login/LoginPageClient.tsx`
- Modify: `src/app/login/page.tsx`

- [ ] **Step 1: Replace `src/app/login/LoginPageClient.tsx` with this content**

```tsx
'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import AuthDialog from '@/features/auth/components/AuthDialog'

export default function LoginPageClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isExpired = searchParams.get('expired') === 'true'

  return (
    <>
      {isExpired && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Your session has expired. Please log in again.
        </div>
      )}
      <AuthDialog isOpen={true} onClose={() => router.push('/')} inline />
    </>
  )
}
```

- [ ] **Step 2: Replace `src/app/login/page.tsx` with this content**

```tsx
import { Suspense } from 'react'
import type { Metadata } from 'next'
import LoginPageClient from './LoginPageClient'

export const metadata: Metadata = {
  title: 'Sign in – Slotify',
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-white/90 backdrop-blur-sm shadow-xl border border-white/60 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />
          <div className="px-8 py-10">
            <Suspense>
              <LoginPageClient />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Manually verify**

Navigate to `/login?expired=true` in the browser. Confirm the amber notice appears above the login form. Navigate to `/login` without the param — confirm the notice is absent.

- [ ] **Step 4: Commit**

```bash
git add fe/src/app/login/LoginPageClient.tsx fe/src/app/login/page.tsx
git commit -m "feat(session): show expired notice on login page when redirected from session timeout"
```

---

## End-to-end verification

After all tasks are complete, run through this flow to confirm everything works together:

1. Log in → check `slotify_session_start` cookie exists in DevTools
2. In DevTools console, set `document.cookie = 'slotify_session_start=1; path=/'` to simulate an expired session from 1970
3. Navigate to `/dashboard` — middleware should redirect to `/login?expired=true`
4. Confirm the amber notice appears on the login page
5. Log in again → cookie resets to current timestamp
6. Log out → confirm cookie is deleted
