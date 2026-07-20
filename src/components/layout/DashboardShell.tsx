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
