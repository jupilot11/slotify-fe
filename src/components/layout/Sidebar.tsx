'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import Avatar from '@/components/ui/Avatar'
import { Skeleton } from '@/components/ui/Skeleton'
import { useUser } from '@/hooks/useUser'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { logoutUser } from '@/features/auth/services/logout.service'
import { useBusinessContext } from '@/lib/contexts/BusinessContext'
import type { BusinessSummary } from '@/types'

type NavItem = {
  label: string
  href: string
  icon: React.ReactNode
}

function buildNavItems(slug: string): NavItem[] {
  const base = `/dashboard/businesses/${slug}`
  return [
    {
      label: 'Dashboard',
      href: base,
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
    },
    {
      label: 'Orders',
      href: `${base}/orders`,
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
          />
        </svg>
      ),
    },
    {
      label: 'Customers',
      href: `${base}/customers`,
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
    {
      label: 'Staff',
      href: `${base}/staff`,
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
    },
    {
      label: 'Analytics',
      href: `${base}/analytics`,
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
    },
    {
      label: 'Settings',
      href: `${base}/settings`,
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
  ]
}

function BusinessSwitcher({
  businesses,
  selected,
  loading,
  onSelect,
}: {
  businesses: BusinessSummary[]
  selected: BusinessSummary | null
  loading: boolean
  onSelect: (biz: BusinessSummary) => void
}) {
  const [open, setOpen] = useState(false)

  if (loading) {
    return <Skeleton className="h-10 w-full rounded-lg" />
  }

  if (!selected) {
    return (
      <Link
        href="/dashboard/businesses/new"
        className="flex items-center gap-2 rounded-lg border border-dashed border-slate-300 px-3 py-2.5 text-sm text-slate-500 hover:bg-slate-50 transition-colors"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add your first business
      </Link>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
      >
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-indigo-600 text-white text-xs font-bold">
          {selected.name.charAt(0).toUpperCase()}
        </div>
        <span className="flex-1 text-left truncate">{selected.name}</span>
        <svg
          className={cn('h-4 w-4 text-slate-400 transition-transform', open && 'rotate-180')}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-10 mt-1 rounded-lg border border-slate-200 bg-white shadow-md overflow-hidden">
          {businesses.map((biz) => (
            <button
              key={biz.id}
              onClick={() => {
                onSelect(biz)
                setOpen(false)
              }}
              className={cn(
                'flex w-full items-center gap-2 px-3 py-2.5 text-sm text-left transition-colors',
                biz.id === selected.id
                  ? 'bg-indigo-50 text-indigo-700 font-medium'
                  : 'text-slate-700 hover:bg-slate-50',
              )}
            >
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-indigo-100 text-indigo-700 text-xs font-bold">
                {biz.name.charAt(0).toUpperCase()}
              </div>
              <span className="truncate">{biz.name}</span>
            </button>
          ))}
          <Link
            href="/dashboard/businesses/new"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 border-t border-slate-100 px-3 py-2.5 text-sm text-indigo-600 hover:bg-indigo-50 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Business
          </Link>
        </div>
      )}
    </div>
  )
}

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useUser()
  const { businesses, selectedBusiness, setSelectedBusiness, status } = useBusinessContext()
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const displayName =
    (user?.user_metadata?.full_name as string | undefined) ??
    user?.email?.split('@')[0] ??
    '—'
  const displayEmail = user?.email ?? ''

  async function handleLogout() {
    setIsLoggingOut(true)
    try {
      await logoutUser()
    } finally {
      router.push('/login')
    }
  }

  const navItems = selectedBusiness ? buildNavItems(selectedBusiness.slug) : []

  return (
    <>
      <aside className="flex h-full w-64 flex-col bg-white border-r border-slate-200 shrink-0">
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
          <BusinessSwitcher
            businesses={businesses}
            selected={selectedBusiness}
            loading={status === 'idle' || status === 'loading'}
            onSelect={setSelectedBusiness}
          />

          {navItems.length > 0 && (
            <ul className="space-y-1">
              {navItems.map((item) => {
                const isActive =
                  item.href === `/dashboard/businesses/${selectedBusiness?.slug}`
                    ? pathname === item.href
                    : pathname.startsWith(item.href)
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                      )}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </nav>

        <div className="border-t border-slate-100 p-4 space-y-1">
          <div className="flex items-center gap-3 px-2 py-2">
            <Avatar name={displayName} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{displayName}</p>
              <p className="text-xs text-slate-500 truncate">{displayEmail}</p>
            </div>
          </div>

          <button
            onClick={() => setShowLogoutDialog(true)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Log out
          </button>
        </div>
      </aside>

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
