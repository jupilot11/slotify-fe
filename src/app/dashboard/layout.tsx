import DashboardShell from '@/components/layout/DashboardShell'
import { BusinessProvider } from '@/lib/contexts/BusinessContext'
import type { ReactNode } from 'react'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <BusinessProvider>
      <DashboardShell>{children}</DashboardShell>
    </BusinessProvider>
  )
}
