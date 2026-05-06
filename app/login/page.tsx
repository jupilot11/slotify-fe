import type { Metadata } from 'next'
import Link from 'next/link'
import Logo from '@/components/layout/Logo'
import LoginForm from '@/features/auth/components/LoginForm'

export const metadata: Metadata = {
  title: 'Sign in – Slotify',
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="h-16 flex items-center px-6">
        <Logo />
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
            <p className="text-slate-500 mt-2 text-sm">Sign in to your Slotify account</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <LoginForm />

            <div className="mt-6 pt-6 border-t border-slate-100 text-center">
              <p className="text-sm text-slate-500">
                Don&apos;t have an account?{' '}
                <Link
                  href="/login"
                  className="text-indigo-600 font-medium hover:text-indigo-700"
                >
                  Sign up free
                </Link>
              </p>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-slate-400">
            Demo: use{' '}
            <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">
              owner@slotify.com
            </span>{' '}
            with any password
          </p>
        </div>
      </div>
    </div>
  )
}
