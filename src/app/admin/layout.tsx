import type { Metadata } from 'next'
import AdminShell from './_components/AdminShell'
import type { ReactNode } from 'react'

export const metadata: Metadata = { title: 'Admin – Slotify' }

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>
}
