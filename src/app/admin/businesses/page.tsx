import type { Metadata } from 'next'
import BusinessesTable from './_components/BusinessesTable'

export const metadata: Metadata = { title: 'Businesses – Admin' }

export default function AdminBusinessesPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Businesses</h1>
          <p className="text-sm text-slate-500 mt-1">Monitor and manage all registered businesses on the platform.</p>
        </div>
      </div>
      <BusinessesTable />
    </div>
  )
}
