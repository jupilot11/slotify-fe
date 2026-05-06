import type { Metadata } from 'next'
import TopBar from '@/components/layout/TopBar'
import { getServicesByBusiness } from '@/services/catalog.service'
import { DEFAULT_BUSINESS_ID } from '@/constants'
import ServicesClient from './_components/ServicesClient'

export const metadata: Metadata = { title: 'Services – Slotify' }

export default async function ServicesPage() {
  const result = await getServicesByBusiness(DEFAULT_BUSINESS_ID)

  return (
    <div>
      <TopBar
        title="Services"
        subtitle="Manage the services your business offers"
      />
      <div className="p-6">
        <ServicesClient initialServices={result.data} businessId={DEFAULT_BUSINESS_ID} />
      </div>
    </div>
  )
}
