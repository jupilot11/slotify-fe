import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getBusinessBySlug } from '@/services/business.service'
import { getServicesByBusiness } from '@/services/catalog.service'
import BookingFlow from './_components/BookingFlow'
import Logo from '@/components/layout/Logo'

interface PageProps {
  params: Promise<{ businessSlug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { businessSlug } = await params
  const result = await getBusinessBySlug(businessSlug)
  if (!result.data) return { title: 'Business Not Found – Slotify' }
  return {
    title: `Book with ${result.data.name} – Slotify`,
    description: result.data.description,
  }
}

export default async function PublicBookingPage({ params }: PageProps) {
  const { businessSlug } = await params

  const businessResult = await getBusinessBySlug(businessSlug)
  if (!businessResult.data) notFound()

  const business = businessResult.data
  const servicesResult = await getServicesByBusiness(business.id)
  const services = servicesResult.data.filter((s) => s.status === 'active')

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 h-16 flex items-center px-4 justify-between">
        <Logo />
        <span className="text-sm text-slate-400">Powered by Slotify</span>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10">
        {/* Business header */}
        <div className="text-center mb-10">
          <div className="h-16 w-16 rounded-2xl bg-indigo-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-indigo-700">
              {business.name[0].toUpperCase()}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{business.name}</h1>
          {business.description && (
            <p className="text-slate-500 mt-2 text-sm max-w-md mx-auto">{business.description}</p>
          )}
          <div className="flex items-center justify-center gap-6 mt-3 text-xs text-slate-400 flex-wrap">
            {business.address && <span>{business.address}</span>}
            {business.phone && <span>{business.phone}</span>}
          </div>
        </div>

        {services.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg font-semibold text-slate-700">No services available</p>
            <p className="text-sm text-slate-400 mt-1">
              This business hasn&apos;t set up any services yet.
            </p>
          </div>
        ) : (
          <BookingFlow business={business} services={services} />
        )}
      </main>
    </div>
  )
}
