import { createClient } from '@/lib/supabase/client'
import type { SelectOption } from '@/types'

export async function getBusinessCategories(): Promise<SelectOption[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('business_categories')
    .select('id, name')
    .eq('is_active', true)
    .order('sort_order')

  if (error) throw new Error(error.message)

  return [
    { label: 'No category', value: '' },
    ...data.map((c) => ({ label: c.name, value: c.id })),
  ]
}
