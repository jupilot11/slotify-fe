'use client'

import { useEffect, useState } from 'react'
import Logo from './Logo'
import Avatar from '@/components/ui/Avatar'
import { supabase } from '@/lib/supabase'

interface UserInfo {
  name: string
  email: string
}

export default function DashboardNavbar() {
  const [user, setUser] = useState<UserInfo | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: authUser } }) => {
      if (authUser) {
        setUser({
          name:
            authUser.user_metadata?.full_name ||
            authUser.user_metadata?.name ||
            authUser.email?.split('@')[0] ||
            'User',
          email: authUser.email ?? '',
        })
      }
    })
  }, [])

  const displayName = user?.name ?? 'User'
  const firstName = displayName.split(' ')[0]
  const username = user?.email?.split('@')[0] ?? ''

  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b border-slate-200 bg-white px-6">
      <Logo />

      <div className="h-6 w-px bg-slate-200" />

      <p className="flex-1 text-sm font-medium text-slate-700">
        Welcome back, {firstName} 👋
      </p>

      <div className="flex items-center gap-1">
        <button
          aria-label="Help"
          className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
            />
          </svg>
        </button>

        <button
          aria-label="Notifications"
          className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
            />
          </svg>
        </button>

        <div className="mx-2 h-6 w-px bg-slate-200" />

        <button className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-slate-50">
          <Avatar name={displayName} size="sm" />
          <div className="text-left">
            <p className="text-sm font-semibold leading-tight text-slate-900">{displayName}</p>
            <p className="text-xs leading-tight text-slate-500">{username}</p>
          </div>
          <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
          </svg>
        </button>
      </div>
    </header>
  )
}
