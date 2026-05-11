'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Logo from './Logo'
import Avatar from '@/components/ui/Avatar'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { useUser } from '@/hooks/useUser'
import { logoutUser } from '@/features/auth/services/logout.service'
import { useBusinessContext } from '@/lib/contexts/BusinessContext'

interface DashboardNavbarProps {
  onMenuClick?: () => void
}

export default function DashboardNavbar({ onMenuClick }: DashboardNavbarProps) {
  const { user, isLoading } = useUser()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    ''
  const firstName = displayName.split(' ')[0]
  const username = user?.email?.split('@')[0] ?? ''

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    if (dropdownOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [dropdownOpen])

  async function handleLogout() {
    setIsLoggingOut(true)
    try {
      await logoutUser()
      window.location.replace('/login')
    } catch {
      setIsLoggingOut(false)
    }
  }

  const settingsHref = '/user/settings'

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4 sm:px-6">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            aria-label="Open sidebar"
            className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors shrink-0"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        )}

        <Logo href='/dashboard' />

        <div className="hidden sm:block h-6 w-px bg-slate-200 mx-1" />

        <div className="hidden sm:block flex-1 text-sm font-medium text-slate-600">
          {isLoading ? (
            <div className="h-4 w-44 animate-pulse rounded bg-slate-200" />
          ) : (
            <>Welcome back, <span className="text-slate-900 font-semibold">{firstName}</span> 👋</>
          )}
        </div>

        <div className="flex-1 sm:flex-none" />

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

          <div className="mx-1.5 h-6 w-px bg-slate-200" />

          {isLoading ? (
            <div className="flex items-center gap-2.5 px-2 py-1.5">
              <div className="h-8 w-8 animate-pulse rounded-full bg-slate-200 shrink-0" />
              <div className="hidden sm:block space-y-1.5">
                <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
                <div className="h-2.5 w-16 animate-pulse rounded bg-slate-200" />
              </div>
            </div>
          ) : (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((o) => !o)}
                className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-slate-50"
              >
                <Avatar name={displayName} size="sm" />
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold leading-tight text-slate-900">{displayName}</p>
                  <p className="text-xs leading-tight text-slate-500">{username}</p>
                </div>
                <svg className="hidden sm:block h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                </svg>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-lg border border-slate-200 bg-white shadow-md overflow-hidden">
                  <Link
                    href={settingsHref}
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Settings
                  </Link>
                  <div className="border-t border-slate-100" />
                  <button
                    onClick={() => {
                      setDropdownOpen(false)
                      setShowLogoutDialog(true)
                    }}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Log out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      <Modal
        isOpen={showLogoutDialog}
        onClose={() => !isLoggingOut && setShowLogoutDialog(false)}
        title="Log out"
      >
        <p className="text-sm text-slate-600 mb-6">
          Are you sure you want to log out? You will need to sign in again to access your dashboard.
        </p>
        <div className="flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={() => setShowLogoutDialog(false)}
            disabled={isLoggingOut}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={handleLogout} disabled={isLoggingOut}>
            {isLoggingOut ? 'Logging out…' : 'Log out'}
          </Button>
        </div>
      </Modal>
    </>
  )
}
