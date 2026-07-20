# Forgot Password Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a complete forgot password flow — modal on the login page, reset email via edge function, recovery callback handling, and a new reset-password page.

> **Note for agentic execution:** Do NOT auto-commit after each step. Stage and show the diff to the user for review before committing. Only commit when the user explicitly approves.

**Architecture:** "Forgot password?" button in `LoginForm` opens a `ForgotPasswordDialog` modal; submitting calls a new `send-password-reset` edge function which triggers Supabase's built-in recovery email. The user clicks the link, lands on `/auth/callback` (extended to detect `type=recovery`), the session is set and the user is redirected to a new `/auth/reset-password` page where they submit their new password via `supabase.auth.updateUser`.

**Tech Stack:** Next.js 16 App Router, Supabase JS v2, React Hook Form, Zod, Tailwind CSS, Deno edge functions

---

## File Map

| Action | Path |
|---|---|
| Create | `supabase/functions/send-password-reset/index.ts` |
| Create | `src/features/auth/validation/forgotPassword.schema.ts` |
| Create | `src/features/auth/services/forgotPassword.service.ts` |
| Create | `src/features/auth/hooks/useForgotPassword.ts` |
| Create | `src/features/auth/hooks/useResetPassword.ts` |
| Create | `src/features/auth/components/ForgotPasswordDialog.tsx` |
| Create | `src/features/auth/components/PasswordStrength.tsx` |
| Create | `src/app/auth/reset-password/page.tsx` |
| Modify | `src/types/auth.ts` |
| Modify | `src/features/auth/services/handleAuthCallback.service.ts` |
| Modify | `src/features/auth/hooks/useAuthCallback.ts` |
| Modify | `src/features/auth/components/LoginForm.tsx` |
| Modify | `src/app/auth/set-password/page.tsx` |

---

## Task 1: Add types to `src/types/auth.ts`

**Files:**
- Modify: `src/types/auth.ts`

- [ ] **Step 1: Append new types at the bottom of `src/types/auth.ts`**

Open `src/types/auth.ts` and add after the last line:

```ts
// ── Forgot Password ──────────────────────────────────────────────────────────

export interface ForgotPasswordRequest {
  email: string
  site_url: string
}

export interface ForgotPasswordResponse {
  success: boolean
  error?: string
}

export type ForgotPasswordStatus = 'idle' | 'loading' | 'success' | 'error'

// ── Reset Password ───────────────────────────────────────────────────────────

export type ResetPasswordStatus = 'idle' | 'loading' | 'success' | 'error'
```

- [ ] **Step 2: Commit**

```bash
git add src/types/auth.ts
git commit -m "feat(auth): add ForgotPassword and ResetPassword types"
```

---

## Task 2: Create forgot password validation schema

**Files:**
- Create: `src/features/auth/validation/forgotPassword.schema.ts`

- [ ] **Step 1: Create the file**

```ts
import { z } from 'zod'

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email'),
})

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
```

- [ ] **Step 2: Commit**

```bash
git add src/features/auth/validation/forgotPassword.schema.ts
git commit -m "feat(auth): add forgotPassword validation schema"
```

---

## Task 3: Create the `send-password-reset` edge function

**Files:**
- Create: `supabase/functions/send-password-reset/index.ts`

- [ ] **Step 1: Create the edge function**

```ts
import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, site_url } = await req.json()

    if (!email || !site_url) {
      return Response.json(
        { success: false, error: 'email and site_url are required.' },
        { status: 400, headers: corsHeaders },
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')

    if (!supabaseUrl || !supabaseAnonKey) {
      return Response.json(
        { success: false, error: 'Missing required environment variables.' },
        { status: 500, headers: corsHeaders },
      )
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${site_url}/auth/callback`,
    })

    // Always return success — never reveal whether the email exists.
    return Response.json(
      { success: true },
      { status: 200, headers: corsHeaders },
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected server error.'
    return Response.json(
      { success: false, error: message },
      { status: 500, headers: corsHeaders },
    )
  }
})
```

- [ ] **Step 2: Commit**

```bash
git add supabase/functions/send-password-reset/index.ts
git commit -m "feat(auth): add send-password-reset edge function"
```

---

## Task 4: Create the forgot password service

**Files:**
- Create: `src/features/auth/services/forgotPassword.service.ts`

- [ ] **Step 1: Create the file**

```ts
import { invokeEdgeFunction } from '@/lib/supabase/invoke'
import type { ForgotPasswordRequest, ForgotPasswordResponse } from '@/types/auth'

export async function forgotPassword(
  payload: ForgotPasswordRequest,
): Promise<ForgotPasswordResponse> {
  return invokeEdgeFunction<ForgotPasswordResponse>('send-password-reset', { body: payload })
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/auth/services/forgotPassword.service.ts
git commit -m "feat(auth): add forgotPassword service"
```

---

## Task 5: Create the `useForgotPassword` hook

**Files:**
- Create: `src/features/auth/hooks/useForgotPassword.ts`

- [ ] **Step 1: Create the file**

```ts
'use client'

import { useRef, useState } from 'react'
import { forgotPassword } from '@/features/auth/services/forgotPassword.service'
import { forgotPasswordSchema } from '@/features/auth/validation/forgotPassword.schema'
import { mapAuthError } from '@/utils/errors'
import type { AuthError, ForgotPasswordStatus } from '@/types/auth'

export interface UseForgotPasswordReturn {
  status: ForgotPasswordStatus
  error: AuthError | null
  submit: (email: string) => Promise<void>
  reset: () => void
}

export function useForgotPassword(): UseForgotPasswordReturn {
  const [status, setStatus] = useState<ForgotPasswordStatus>('idle')
  const [error, setError] = useState<AuthError | null>(null)
  const isInflightRef = useRef(false)

  const submit = async (email: string) => {
    const parsed = forgotPasswordSchema.safeParse({ email })
    if (!parsed.success) {
      setError({ message: parsed.error.issues[0].message })
      setStatus('error')
      return
    }

    if (isInflightRef.current) return
    isInflightRef.current = true

    setStatus('loading')
    setError(null)

    try {
      await forgotPassword({
        email: parsed.data.email.trim().toLowerCase(),
        site_url: window.location.origin,
      })
      setStatus('success')
    } catch (err) {
      const mapped = mapAuthError(err)
      setError(mapped)
      setStatus('error')
    } finally {
      isInflightRef.current = false
    }
  }

  const reset = () => {
    setStatus('idle')
    setError(null)
  }

  return { status, error, submit, reset }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/auth/hooks/useForgotPassword.ts
git commit -m "feat(auth): add useForgotPassword hook"
```

---

## Task 6: Extract `PasswordStrength` into its own component

The `PasswordStrength` component is currently defined inline inside `src/app/auth/set-password/page.tsx`. Extract it so both set-password and the new reset-password page can share it.

**Files:**
- Create: `src/features/auth/components/PasswordStrength.tsx`
- Modify: `src/app/auth/set-password/page.tsx`

- [ ] **Step 1: Create `src/features/auth/components/PasswordStrength.tsx`**

```tsx
'use client'

const PASSWORD_CHECKS = [
  { label: '8+ characters', test: (v: string) => v.length >= 8 },
  { label: 'Uppercase', test: (v: string) => /[A-Z]/.test(v) },
  { label: 'Lowercase', test: (v: string) => /[a-z]/.test(v) },
  { label: 'Number', test: (v: string) => /[0-9]/.test(v) },
  { label: 'Special char', test: (v: string) => /[^A-Za-z0-9]/.test(v) },
]

const STRENGTH_LEVELS = [
  { label: 'Weak', barColor: 'bg-red-500', textColor: 'text-red-500', segments: 1 },
  { label: 'Fair', barColor: 'bg-orange-400', textColor: 'text-orange-500', segments: 2 },
  { label: 'Good', barColor: 'bg-indigo-500', textColor: 'text-indigo-600', segments: 3 },
  { label: 'Strong', barColor: 'bg-emerald-500', textColor: 'text-emerald-600', segments: 4 },
]

function getStrengthIndex(passed: number) {
  if (passed <= 2) return 0
  if (passed === 3) return 1
  if (passed === 4) return 2
  return 3
}

export default function PasswordStrength({ value }: { value: string }) {
  if (!value) return null

  const passed = PASSWORD_CHECKS.filter((c) => c.test(value)).length
  const idx = getStrengthIndex(passed)
  const { label, barColor, textColor, segments } = STRENGTH_LEVELS[idx]

  return (
    <div className="space-y-2.5 pt-2.5">
      <div className="flex items-center gap-2.5">
        <div className="flex flex-1 gap-1">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                i < segments ? barColor : 'bg-slate-200'
              }`}
            />
          ))}
        </div>
        <span className={`text-xs font-semibold transition-colors duration-300 w-12 text-right ${textColor}`}>
          {label}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {PASSWORD_CHECKS.map(({ label: checkLabel, test }) => {
          const pass = test(value)
          return (
            <span
              key={checkLabel}
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-all duration-200 ${
                pass
                  ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              {pass ? (
                <svg className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span className="h-3 w-3 flex items-center justify-center leading-none">·</span>
              )}
              {checkLabel}
            </span>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Update `src/app/auth/set-password/page.tsx`**

Remove the inline `PASSWORD_CHECKS`, `STRENGTH_LEVELS`, `getStrengthIndex`, and `PasswordStrength` definitions (lines 14–85), and add this import at the top with the other imports:

```tsx
import PasswordStrength from '@/features/auth/components/PasswordStrength'
```

The rest of the file is unchanged — `<PasswordStrength value={passwordValue} />` stays as-is.

- [ ] **Step 3: Verify the set-password page still works**

Run `npm run dev` and navigate to `http://localhost:3000/auth/set-password?email=test@example.com`. The password strength meter should still appear and animate as you type.

- [ ] **Step 4: Commit**

```bash
git add src/features/auth/components/PasswordStrength.tsx src/app/auth/set-password/page.tsx
git commit -m "refactor(auth): extract PasswordStrength into shared component"
```

---

## Task 7: Create the `ForgotPasswordDialog` component

**Files:**
- Create: `src/features/auth/components/ForgotPasswordDialog.tsx`

- [ ] **Step 1: Create the file**

```tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { useForgotPassword } from '@/features/auth/hooks/useForgotPassword'
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/features/auth/validation/forgotPassword.schema'

interface ForgotPasswordDialogProps {
  isOpen: boolean
  onClose: () => void
}

export default function ForgotPasswordDialog({ isOpen, onClose }: ForgotPasswordDialogProps) {
  const { status, error, submit, reset: resetHook } = useForgotPassword()

  const {
    register,
    handleSubmit,
    reset: resetForm,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const handleClose = () => {
    resetHook()
    resetForm()
    onClose()
  }

  const onSubmit = async ({ email }: ForgotPasswordFormData) => {
    await submit(email)
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      {status === 'success' ? (
        <div className="flex flex-col items-center gap-5 py-2 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
            <svg className="h-7 w-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-slate-900">Check your inbox</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              If an account exists for that email, you&apos;ll receive a password reset link shortly.
            </p>
          </div>
          <Button className="w-full" size="lg" onClick={handleClose}>
            Back to login
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-5 py-2">
          <div className="text-center space-y-2">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50">
              <svg className="h-7 w-7 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Reset your password</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Enter your email and we&apos;ll send you a reset link.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 px-4 py-3 rounded-r-lg">
              <p className="text-sm text-red-700">{error.message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              error={errors.email?.message}
              {...register('email')}
            />
            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={status === 'loading'}
            >
              Send reset link
            </Button>
          </form>
        </div>
      )}
    </Modal>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/auth/components/ForgotPasswordDialog.tsx
git commit -m "feat(auth): add ForgotPasswordDialog component"
```

---

## Task 8: Wire `ForgotPasswordDialog` into `LoginForm`

**Files:**
- Modify: `src/features/auth/components/LoginForm.tsx`

- [ ] **Step 1: Add the import at the top of `LoginForm.tsx`**

Add alongside the other feature imports:

```tsx
import ForgotPasswordDialog from '@/features/auth/components/ForgotPasswordDialog'
```

- [ ] **Step 2: Add the dialog state inside the `LoginForm` component**

Add after the existing `useState` declarations (e.g. after `const [resendStatus, ...]`):

```tsx
const [showForgotPassword, setShowForgotPassword] = useState(false)
```

- [ ] **Step 3: Render the dialog**

In the JSX, the component currently opens with `<>`. Add the dialog render right after the opening fragment, alongside `<PasswordSetupDialog ...>`:

```tsx
<ForgotPasswordDialog
  isOpen={showForgotPassword}
  onClose={() => setShowForgotPassword(false)}
/>
```

- [ ] **Step 4: Wire the button**

Find the "Forgot password?" button (around line 182) and add the `onClick` handler:

```tsx
<button
  type="button"
  onClick={() => setShowForgotPassword(true)}
  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
>
  Forgot password?
</button>
```

- [ ] **Step 5: Verify in the browser**

Run `npm run dev`, navigate to `http://localhost:3000/login`, enter any email and click "Continue" to reveal the password field, then click "Forgot password?". The modal should open, accept an email, and on submit show a loading state followed by the success confirmation.

- [ ] **Step 6: Commit**

```bash
git add src/features/auth/components/LoginForm.tsx
git commit -m "feat(auth): wire ForgotPasswordDialog into LoginForm"
```

---

## Task 9: Create the `useResetPassword` hook

**Files:**
- Create: `src/features/auth/hooks/useResetPassword.ts`

- [ ] **Step 1: Create the file**

```ts
'use client'

import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { mapAuthError } from '@/utils/errors'
import type { AuthError, ResetPasswordStatus } from '@/types/auth'

export interface UseResetPasswordReturn {
  status: ResetPasswordStatus
  error: AuthError | null
  submit: (password: string) => Promise<boolean>
}

export function useResetPassword(): UseResetPasswordReturn {
  const [status, setStatus] = useState<ResetPasswordStatus>('idle')
  const [error, setError] = useState<AuthError | null>(null)
  const isInflightRef = useRef(false)

  const submit = async (password: string): Promise<boolean> => {
    if (isInflightRef.current) return false
    isInflightRef.current = true

    setStatus('loading')
    setError(null)

    try {
      const supabase = createClient()
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) throw updateError
      await supabase.auth.signOut()
      setStatus('success')
      return true
    } catch (err) {
      const mapped = mapAuthError(err)
      setError(mapped)
      setStatus('error')
      return false
    } finally {
      isInflightRef.current = false
    }
  }

  return { status, error, submit }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/auth/hooks/useResetPassword.ts
git commit -m "feat(auth): add useResetPassword hook"
```

---

## Task 10: Extend `handleAuthCallback` and `useAuthCallback` for `type=recovery`

**Files:**
- Modify: `src/features/auth/services/handleAuthCallback.service.ts`
- Modify: `src/features/auth/hooks/useAuthCallback.ts`

- [ ] **Step 1: Update `handleAuthCallback.service.ts`**

Add `redirectTo?: string` to the `HandleAuthCallbackResult` interface and insert the `type=recovery` branch before the `type=signup` block. Replace the entire file with:

```ts
import { createClient } from '@/lib/supabase/client'
import { markEmailVerified } from './emailVerificationCallback.service'

interface HandleAuthCallbackParams {
  accessToken: string
  refreshToken: string
  type: string | null
}

interface HandleAuthCallbackResult {
  success: boolean
  error?: string
  redirectTo?: string
}

export async function handleAuthCallback({
  accessToken,
  refreshToken,
  type,
}: HandleAuthCallbackParams): Promise<HandleAuthCallbackResult> {
  const supabase = createClient()

  const { error: sessionError } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  })

  if (sessionError) {
    return { success: false, error: 'Invalid or expired verification link. Please request a new one.' }
  }

  if (type === 'recovery') {
    return { success: true, redirectTo: '/auth/reset-password' }
  }

  if (type === 'signup') {
    try {
      await markEmailVerified(accessToken)
    } catch {
      // Non-fatal: session is established; profile update can be retried
    }
  }

  await supabase.auth.signOut()
  return { success: true }
}
```

- [ ] **Step 2: Update `useAuthCallback.ts`**

Add `useRouter` and handle `result.redirectTo`. Replace the entire file with:

```ts
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { handleAuthCallback } from '../services/handleAuthCallback.service'

type CallbackStatus = 'verifying' | 'success' | 'error'

interface UseAuthCallbackReturn {
  status: CallbackStatus
  errorMessage: string | null
}

export function useAuthCallback(): UseAuthCallbackReturn {
  const [status, setStatus] = useState<CallbackStatus>('verifying')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const hash = window.location.hash.substring(1)
    const params = new URLSearchParams(hash)

    const accessToken = params.get('access_token')
    const refreshToken = params.get('refresh_token')
    const type = params.get('type')

    if (!accessToken || !refreshToken) {
      setErrorMessage('Missing authentication tokens. Please try again.')
      setStatus('error')
      return
    }

    handleAuthCallback({ accessToken, refreshToken, type }).then((result) => {
      if (result.success) {
        if (result.redirectTo) {
          router.replace(result.redirectTo)
        } else {
          setStatus('success')
        }
      } else {
        setErrorMessage(result.error ?? 'Something went wrong.')
        setStatus('error')
      }
    })
  }, [router])

  return { status, errorMessage }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/features/auth/services/handleAuthCallback.service.ts src/features/auth/hooks/useAuthCallback.ts
git commit -m "feat(auth): extend callback handler to support type=recovery"
```

---

## Task 11: Create the `/auth/reset-password` page

**Files:**
- Create: `src/app/auth/reset-password/page.tsx`

- [ ] **Step 1: Create the file**

```tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import PasswordStrength from '@/features/auth/components/PasswordStrength'
import EyeIcon from '@/components/ui/EyeIcon'
import { setPasswordSchema, type SetPasswordFormData } from '@/features/auth/validation/setPassword.schema'
import { useResetPassword } from '@/features/auth/hooks/useResetPassword'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [sessionChecked, setSessionChecked] = useState(false)
  const [hasSession, setHasSession] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const { status, error, submit } = useResetPassword()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data }) => {
      setHasSession(!!data.session)
      setSessionChecked(true)
    })
  }, [])

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<SetPasswordFormData>({
    resolver: zodResolver(setPasswordSchema),
    mode: 'onChange',
  })

  const passwordValue = watch('password', '')

  useEffect(() => {
    if (!showSuccess) return
    const t = setTimeout(() => router.push('/login'), 3000)
    return () => clearTimeout(t)
  }, [showSuccess, router])

  const onSubmit = async ({ password }: SetPasswordFormData) => {
    const ok = await submit(password)
    if (ok) setShowSuccess(true)
  }

  if (!sessionChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-pulse rounded-full bg-slate-200" />
      </div>
    )
  }

  if (!hasSession) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="rounded-2xl bg-white/90 backdrop-blur-sm shadow-xl border border-white/60 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />
            <div className="px-8 py-10 text-center space-y-6">
              <div className="flex justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-red-50 to-red-100 shadow-sm ring-1 ring-red-200">
                  <svg className="h-7 w-7 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
              <div className="space-y-1.5">
                <h1 className="text-lg font-semibold text-slate-800">Link expired or invalid</h1>
                <p className="text-sm text-slate-500">
                  This password reset link is no longer valid. Please request a new one.
                </p>
              </div>
              <Button variant="outline" className="w-full" size="md" onClick={() => router.replace('/login')}>
                Back to login
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-white/90 backdrop-blur-sm shadow-xl border border-white/60 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />
          <div className="px-8 py-10">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-100 shadow-sm ring-1 ring-indigo-100">
                <svg className="h-7 w-7 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
              <h1 className="text-2xl font-semibold text-slate-900">Reset your password</h1>
              <p className="mt-2.5 text-sm text-slate-500">Choose a new strong password for your account.</p>
            </div>

            {error && (
              <div className="mb-4 flex items-start gap-3 bg-red-50 border-l-4 border-red-500 px-4 py-3 rounded-r-lg">
                <p className="text-sm text-red-700">{error.message}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <div className="relative">
                  <Input
                    label="New password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className="pr-10"
                    error={errors.password?.message}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-[34px] text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
                <PasswordStrength value={passwordValue} />
              </div>

              <div className="relative">
                <Input
                  label="Confirm password"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="pr-10"
                  error={errors.confirmPassword?.message}
                  {...register('confirmPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-[34px] text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                >
                  <EyeIcon open={showConfirm} />
                </button>
              </div>

              <Button
                type="submit"
                className="w-full mt-1"
                size="lg"
                disabled={!isValid}
                isLoading={status === 'loading'}
              >
                Reset password
              </Button>
            </form>
          </div>
        </div>
      </div>

      <Modal isOpen={showSuccess} onClose={() => router.push('/login')}>
        <div className="flex flex-col items-center gap-5 py-3 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-green-100 shadow-sm ring-1 ring-emerald-200">
            <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <div className="space-y-1.5">
            <h3 className="text-xl font-semibold text-slate-900">Password reset!</h3>
            <p className="text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">
              Your password has been updated. You&apos;ll be redirected to login in a moment.
            </p>
          </div>
          <div className="w-full space-y-2">
            <Button className="w-full" size="lg" onClick={() => router.push('/login')}>
              Go to login
            </Button>
            <p className="text-xs text-slate-400">Redirecting automatically in 3 seconds…</p>
          </div>
        </div>
      </Modal>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/auth/reset-password/page.tsx
git commit -m "feat(auth): add reset-password page"
```

---

## Task 12: Final lint check and verification

- [ ] **Step 1: Run the linter**

```bash
npm run lint
```

Expected: no errors. Fix any reported issues before continuing.

- [ ] **Step 2: Run the dev server and do a full manual smoke test**

```bash
npm run dev
```

**Smoke test checklist:**
1. Navigate to `http://localhost:3000/login`
2. Enter a valid email → "Continue" → password field appears → click "Forgot password?" → modal opens ✓
3. Submit the modal with an invalid email → inline validation error appears ✓
4. Submit with a valid email → loading state → success confirmation ("Check your inbox") ✓
5. Close and reopen the dialog → form is reset to empty ✓
6. Navigate to `http://localhost:3000/auth/reset-password` directly (no session) → "Link expired or invalid" error state with "Back to login" button ✓
7. The existing `/auth/set-password` page → password strength meter still works ✓

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "feat(auth): implement forgot password flow"
```
