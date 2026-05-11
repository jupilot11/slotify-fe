'use client'

import { useEffect, useState } from 'react'
import { getBusinessCategories } from '../services/getBusinessCategories.service'
import type { SelectOption } from '@/types'

export function useBusinessCategories() {
  const [categories, setCategories] = useState<SelectOption[]>([])

  useEffect(() => {
    getBusinessCategories().then(setCategories).catch(() => {})
  }, [])

  return { categories }
}
