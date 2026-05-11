'use client'

import { useEffect } from 'react'
import { useBusinessContext } from '@/lib/contexts/BusinessContext'

export default function BusinessSlugSync({ slug }: { slug: string }) {
  const { businesses, setSelectedBusiness } = useBusinessContext()

  useEffect(() => {
    const match = businesses.find((b) => b.slug === slug)
    if (match) setSelectedBusiness(match)
  }, [slug, businesses, setSelectedBusiness])

  return null
}
