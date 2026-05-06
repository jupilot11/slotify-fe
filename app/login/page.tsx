import type { Metadata } from 'next'
import Logo from '@/components/layout/Logo'
import LoginPageClient from './LoginPageClient'

export const metadata: Metadata = {
  title: 'Sign in – Slotify',
}

const ARC_SIZES = [480, 680, 880, 1080]

export default function LoginPage() {
  return (
    <div className="min-h-screen">
      <div className="absolute inset-0 overflow-hidden">
        {ARC_SIZES.map((size, i) => (
          <svg
            key={i}
            className="absolute opacity-20"
            style={{
              width: size,
              height: size,
              top: `calc(50% - ${size / 2}px)`,
              left: `calc(50% - ${size / 2}px)`,
            }}
            fill="none"
            viewBox={`0 0 ${size} ${size}`}
          >
            <circle
              cx={size / 2}
              cy={size / 2}
              r={(size - 4) / 2}
              stroke="currentColor"
              strokeWidth="4"
            />
          </svg>
        ))}
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
          <div className="flex flex-col items-center gap-4 mb-6">
            <Logo className="h-10" />
            <h1 className="text-2xl font-bold text-slate-900">Sign in to your account</h1>
            <p className="text-sm text-slate-500">Enter your email and password to continue.</p>
          </div>

          <LoginPageClient />
        </div>
      </div>
    </div>
  )
}
