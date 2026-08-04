import type { Metadata } from 'next'
import PricingTable from './_components/PricingTable'

export const metadata: Metadata = { title: 'Pricing – Admin' }

export default function AdminPricingPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PricingTable />
    </div>
  )
}
