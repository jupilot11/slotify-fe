'use client'

import { useState, useRef, useEffect } from 'react'
import Logo from '@/components/layout/Logo'
import Avatar from '@/components/ui/Avatar'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { useUser } from '@/hooks/useUser'
import { logoutUser } from '@/features/auth/services/logout.service'

const MOCK_NOTIFICATIONS = [
  { id: 1, message: 'New business "Glow Studio" registered', time: '2 min ago', unread: true },
  { id: 2, message: 'User carlo@freshfade.ph was suspended', time: '1 hr ago', unread: true },
  { id: 3, message: 'Booking #BK-2291 was cancelled', time: '3 hr ago', unread: true },
  { id: 4, message: 'Weekly digest report is ready', time: 'Yesterday', unread: false },
  { id: 5, message: '42 bookings completed platform-wide', time: 'Yesterday', unread: false },
]

interface AdminNavbarProps {
  onMenuClick: () => void
}

export default function AdminNavbar({ onMenuClick }: AdminNavbarProps) {
  const { user, isLoading } = useUser()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const dropdownRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    'Admin'
  const username = user?.email?.split('@')[0] ?? ''

  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => n.unread).length

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
    }
    if (dropdownOpen || notifOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [dropdownOpen, notifOpen])

  async function handleLogout() {
    setIsLoggingOut(true)
    try {
      await logoutUser()
      window.location.replace('/login')
    } catch {
      setIsLoggingOut(false)
    }
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/90 backdrop-blur-sm">
        <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
          {/* Mobile hamburger */}
          <button
            onClick={onMenuClick}
            aria-label="Open menu"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition-colors lg:hidden shrink-0"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>

          {/* Logo + Admin badge */}
          <div className="flex items-center gap-2.5">
            <Logo href="/admin" />

          </div>

          <div className="flex-1" />

          {/* Right controls */}
          <div className="flex items-center gap-1">
            {/* Notification bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => { setNotifOpen((o) => !o); setDropdownOpen(false) }}
                aria-label="Notifications"
                className="relative flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white leading-none">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-full z-50 mt-1.5 w-80 rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                    <span className="text-sm font-semibold text-slate-900">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="text-xs text-red-600 font-medium">{unreadCount} unread</span>
                    )}
                  </div>
                  <ul className="divide-y divide-slate-50 max-h-72 overflow-y-auto">
                    {MOCK_NOTIFICATIONS.map((notif) => (
                      <li key={notif.id} className={`flex items-start gap-3 px-4 py-3 ${notif.unread ? 'bg-red-50/40' : ''}`}>
                        <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${notif.unread ? 'bg-red-500' : 'bg-slate-200'}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-700 leading-snug">{notif.message}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{notif.time}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="border-t border-slate-100 px-4 py-2.5">
                    <button className="text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors">
                      Mark all as read
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="mx-1.5 h-5 w-px bg-slate-200" />

            {/* User avatar + dropdown */}
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
                  onClick={() => { setDropdownOpen((o) => !o); setNotifOpen(false) }}
                  className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-slate-50"
                >
                  <Avatar name={displayName} size="sm" className="bg-red-100 text-red-700" />
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-semibold leading-tight text-slate-900">{displayName}</p>
                    <p className="text-xs leading-tight text-slate-500">{username}</p>
                  </div>
                  <svg className="hidden sm:block h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                  </svg>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-xl border border-slate-200 bg-white shadow-md overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-xs font-semibold text-red-600 uppercase tracking-wide">Admin</p>
                      <p className="text-sm font-medium text-slate-900 mt-0.5 truncate">{displayName}</p>
                    </div>
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
        </div>
      </header>

      <Modal
        isOpen={showLogoutDialog}
        onClose={() => !isLoggingOut && setShowLogoutDialog(false)}
        title="Log out"
      >
        <p className="text-sm text-slate-600 mb-6">
          Are you sure you want to log out of the admin panel?
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setShowLogoutDialog(false)} disabled={isLoggingOut}>
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
