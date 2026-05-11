'use client'

import { useState } from 'react'
import Sidebar from './Sidebar'
import DashboardNavbar from './DashboardNavbar'
import type { ReactNode } from 'react'

interface DashboardShellProps {
  children: ReactNode
}

export default function DashboardShell({ children }: DashboardShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50">
      <DashboardNavbar onMenuClick={() => setIsSidebarOpen(true)} />
      <div className="relative flex flex-1 overflow-hidden">
        {/* Mobile backdrop */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-black/40 lg:hidden animate-overlay-show"
            onClick={() => setIsSidebarOpen(false)}
            aria-hidden="true"
          />
        )}
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
