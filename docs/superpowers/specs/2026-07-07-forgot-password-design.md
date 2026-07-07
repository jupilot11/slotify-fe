# Forgot Password — Design Spec

**Date:** 2026-07-07  
**Status:** Approved

---

## Overview

Add a forgot password flow to the Slotify login screen. A user who has forgotten their password can request a reset email from a modal dialog, click the link in the email to land on the existing `/auth/callback` page, then set a new password on a dedicated `/auth/reset-password` page before being redirected to `/login`.

---

## End-to-End Flow

```
[LoginForm] "Forgot password?" clicked
    → ForgotPasswordDialog opens (modal)
    → user enters email, submits
    → forgotPassword.service.ts calls edge fn "send-password-reset" with { email, site_url }
    → edge fn calls supabase.auth.resetPasswordForEmail(email, { redirectTo: site_url + "/auth/callback" })
    → edge fn returns { success: true }
    → dialog shows confirmation: "Check your email for a reset link"

    → user clicks link in email
    → /auth/callback reads URL hash: type=recovery, access_token, refresh_token
    → handleAuthCallback detects type=recovery
        → sets Supabase session (same as today)
        → does NOT sign out (unlike signup flow)
        → redirects to /auth/reset-password
    → /auth/reset-password renders password form
    → user submits new password
    → useResetPassword calls supabase.auth.updateUser({ password })
    → success modal shown → auto-redirect to /login after 3 s
```

---

## New Pieces

### 1. Edge Function — `send-password-reset`

**Path:** `supabase/functions/send-password-reset/index.ts`

- Accepts `POST { email: string, site_url: string }`
- Calls `supabase.auth.resetPasswordForEmail(email, { redirectTo: site_url + "/auth/callback" })` using the anon key client
- Returns `{ success: true }` on success; `{ success: false, error: string }` on failure
- Always returns `success: true` even when the email is not found — avoids leaking whether an account exists (standard security practice for password reset)

### 2. Service — `forgotPassword.service.ts`

**Path:** `src/features/auth/services/forgotPassword.service.ts`

- Calls `invokeEdgeFunction<ForgotPasswordResponse>('send-password-reset', { body: payload })`
- Same shape as `resendVerificationLink.service.ts`

### 3. Types — additions to `src/types/auth.ts`

```ts
export interface ForgotPasswordRequest {
  email: string
  site_url: string
}

export interface ForgotPasswordResponse {
  success: boolean
  error?: string
}

export type ForgotPasswordStatus = 'idle' | 'loading' | 'success' | 'error'
export type ResetPasswordStatus = 'idle' | 'loading' | 'success' | 'error'
```

### 4. Hook — `useForgotPassword`

**Path:** `src/features/auth/hooks/useForgotPassword.ts`

- State: `status: ForgotPasswordStatus`, `error: AuthError | null`
- Exports `submit(email: string): Promise<void>` — validates email, calls service, sets state
- Inflight guard (same `isInflightRef` pattern as `useEmailVerification`)

### 5. Component — `ForgotPasswordDialog`

**Path:** `src/features/auth/components/ForgotPasswordDialog.tsx`

- Props: `isOpen: boolean`, `onClose: () => void`
- Uses `Modal` from `components/ui/Modal`
- Contains a single email `Input` field + submit `Button`
- Uses `useForgotPassword` hook for state
- On `status === 'success'`: replaces form with confirmation message ("Check your inbox for a reset link")
- On close: resets hook state so re-opening starts fresh
- Validates with a Zod schema (email only)

### 6. `LoginForm` — wire up dialog

**Path:** `src/features/auth/components/LoginForm.tsx`

- Add `useState` for `showForgotPassword: boolean`
- "Forgot password?" button gets `onClick={() => setShowForgotPassword(true)}`
- Render `<ForgotPasswordDialog isOpen={showForgotPassword} onClose={() => setShowForgotPassword(false)} />`

### 7. `handleAuthCallback` — extend for recovery

**Path:** `src/features/auth/services/handleAuthCallback.service.ts`

Current behaviour for `type=signup`: set session → mark email verified → sign out.

New branch for `type=recovery`:
- Set session (same call, already there)
- Skip `markEmailVerified`
- Skip `signOut`
- Return `{ success: true, redirectTo: '/auth/reset-password' }`

The `useAuthCallback` hook reads `result.success` to set `status`. Extend it to also read `result.redirectTo` and call `router.replace(redirectTo)` instead of showing the success state.

### 8. Page — `/auth/reset-password`

**Path:** `src/app/auth/reset-password/page.tsx`

- Renders a password form identical in structure to `/auth/set-password`
- Reuses the `PasswordStrength` component (extract to `src/features/auth/components/PasswordStrength.tsx` from `set-password/page.tsx`)
- Uses `useResetPassword` hook
- On success: shows the same success modal pattern as `/auth/set-password` → auto-redirects to `/login` after 3 s
- If no active session when the page loads (e.g. expired token), shows an error state with a "Back to login" link

### 9. Hook — `useResetPassword`

**Path:** `src/features/auth/hooks/useResetPassword.ts`

- State: `status: ResetPasswordStatus`, `error: AuthError | null`
- Exports `submit(password: string): Promise<boolean>`
- Calls `supabase.auth.updateUser({ password })` directly (session is already set by the callback)
- Signs out after success so the user lands on `/login` with a clean state
- Maps errors via `mapAuthError`

---

## Validation Schema

**Path:** `src/features/auth/validation/forgotPassword.schema.ts`

```ts
z.object({ email: z.string().email('Please enter a valid email') })
```

The reset password form reuses the existing `setPassword.schema.ts`.

---

## Error Handling

| Scenario | Behaviour |
|---|---|
| Email not in system | Edge fn returns success anyway (no account enumeration) |
| Edge fn network error | `useForgotPassword` sets `error`, dialog shows inline error message |
| Expired/invalid reset token | `handleAuthCallback` returns `{ success: false, error: '...' }` → `/auth/callback` shows its existing error state |
| No session on `/auth/reset-password` | Page detects missing session, shows error + "Back to login" |
| `updateUser` failure | `useResetPassword` sets error, page shows inline error |

---

## Files Changed / Created

| Action | Path |
|---|---|
| **Create** | `supabase/functions/send-password-reset/index.ts` |
| **Create** | `src/features/auth/services/forgotPassword.service.ts` |
| **Create** | `src/features/auth/hooks/useForgotPassword.ts` |
| **Create** | `src/features/auth/hooks/useResetPassword.ts` |
| **Create** | `src/features/auth/components/ForgotPasswordDialog.tsx` |
| **Create** | `src/features/auth/components/PasswordStrength.tsx` (extracted) |
| **Create** | `src/features/auth/validation/forgotPassword.schema.ts` |
| **Create** | `src/app/auth/reset-password/page.tsx` |
| **Edit** | `src/features/auth/components/LoginForm.tsx` |
| **Edit** | `src/features/auth/services/handleAuthCallback.service.ts` |
| **Edit** | `src/features/auth/hooks/useAuthCallback.ts` |
| **Edit** | `src/types/auth.ts` |
| **Edit** | `src/app/auth/set-password/page.tsx` (remove inline PasswordStrength, import extracted component) |
