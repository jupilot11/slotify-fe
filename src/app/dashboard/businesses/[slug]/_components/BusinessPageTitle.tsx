'use client'

import { useBusinessContext } from '@/lib/contexts/BusinessContext'

export default function BusinessPageTitle() {
  const { selectedBusiness } = useBusinessContext()

  return (
    <h1 className="text-xl font-semibold text-slate-900">
      {selectedBusiness ? selectedBusiness.name : 'Dashboard'}
    </h1>
  )
}
