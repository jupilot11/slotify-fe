import type { Metadata } from 'next'
import TopBar from '@/components/layout/TopBar'
import { getBusinessById } from '@/services/business.service'
import { DEFAULT_BUSINESS_ID } from '@/constants'
import SettingsClient from './_components/SettingsClient'

export const metadata: Metadata = { title: 'Settings – Slotify' }

export default async function SettingsPage() {
  const result = await getBusinessById(DEFAULT_BUSINESS_ID)

  return (
    <div>
      <TopBar title="Settings" subtitle="Manage your business profile" />
      <div className="p-6 max-w-2xl">
        {result.data ? (
          <SettingsClient business={result.data} />
        ) : (
          <p className="text-sm text-red-600">Business not found.</p>
        )}
      </div>
    </div>
  )
}
