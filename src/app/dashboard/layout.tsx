import DashboardNavbar from '@/components/layout/DashboardNavbar'
import Sidebar from '@/components/layout/Sidebar'
import { BusinessProvider } from '@/lib/contexts/BusinessContext'
import type { ReactNode } from 'react'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <BusinessProvider>
      <div className="flex h-screen flex-col overflow-hidden bg-slate-50">
        <DashboardNavbar />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </BusinessProvider>
  )
}
