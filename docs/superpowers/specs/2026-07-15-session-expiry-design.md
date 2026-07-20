# Session Expiry Design

**Date:** 2026-07-15  
**Status:** Approved

## Overview

Enforce a hard 24-hour session limit per browser. After 24 hours from login, the user is automatically logged out. A blocking modal countdown appears at the 5-minute mark to warn them before it happens.

## Requirements

- Hard 24-hour limit — no extension possible
- Warning modal appears 5 minutes before expiry with a live countdown
- Modal has one action: "Log out now"
- After expiry, user is redirected to `/login?expired=true`
- Login page shows a notice when `?expired=true` is present
- Enforcement is both server-side (middleware) and client-side (hook + modal)

## Cookie: `slotify_session_start`

Set by `loginUser` immediately after `supabase.auth.setSession` succeeds:

```
slotify_session_start=<unix_ms_timestamp>; path=/; max-age=86400; SameSite=Lax
```

- Not `HttpOnly` — client hook must read it via `document.cookie`
- `max-age=86400` is a browser-level safety net (auto-deletes at 24h)
- Deleted (set `max-age=0`) on logout in `logoutUser`

## Middleware enforcement (`src/middleware.ts`)

After the existing `getUser()` call, for authenticated users on protected routes:

1. Read `slotify_session_start` from request cookies
2. If missing or `(Date.now() - session_start) >= 86_400_000`:
   - Call `supabase.auth.signOut()`
   - Redirect to `/login?expired=true`

This check runs before the role/redirect logic. No-op if user is already unauthenticated.

## Hook: `useSessionExpiry` (`src/hooks/useSessionExpiry.ts`)

Reads `slotify_session_start` from `document.cookie` on mount.

- Computes `timeRemaining = 86_400_000 - (Date.now() - session_start)`
- Sets a timeout at `timeRemaining - 300_000` (5 min before) → `showWarning = true`
- Sets a timeout at `timeRemaining` → calls `logoutUser()` + `router.push('/login?expired=true')`
- While `showWarning` is true, runs a 1-second interval to drive `secondsRemaining` countdown
- Returns `{ showWarning, secondsRemaining }`
- No-op if cookie is absent

## Component: `SessionExpiryModal` (`src/features/auth/components/SessionExpiryModal.tsx`)

Props: `{ isOpen: boolean; secondsRemaining: number }`

Content:
- Title: "Session Expiring"
- Body: "For your security, you will be logged out in **M:SS**."
- Button: "Log out now" → `logoutUser()` + redirect to `/login`
- No dismiss/close option — blocking until expiry

## Mount point

`SessionExpiryModal` is rendered inside `DashboardShell` (already a client component). `useSessionExpiry` is called there and its return values are passed directly to the modal.

## Login page notice (`src/app/login/LoginPageClient.tsx`)

Reads `useSearchParams()`. If `expired=true` is present, renders a notice above `AuthDialog`:

> "Your session has expired. Please log in again."

## Files changed

| File | Change |
|---|---|
| `src/features/auth/services/login.service.ts` | Set `slotify_session_start` cookie after setSession |
| `src/features/auth/services/logout.service.ts` | Delete `slotify_session_start` cookie on signOut |
| `src/middleware.ts` | Check session age, sign out + redirect if ≥ 24h |
| `src/hooks/useSessionExpiry.ts` | New hook — reads cookie, drives warning + auto-logout |
| `src/features/auth/components/SessionExpiryModal.tsx` | New modal component |
| `src/components/layout/DashboardShell.tsx` | Mount hook + modal |
| `src/app/login/LoginPageClient.tsx` | Show expired notice from search param |
