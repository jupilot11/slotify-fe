import { createClient } from '@/lib/supabase/client'

export async function uploadServiceImage(businessId: string, file: File): Promise<string> {
  const supabase = createClient()
  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `services/${businessId}/${Date.now()}.${ext}`
  const { error } = await supabase.storage.from('slotify').upload(path, file)
  if (error) throw new Error(`Image upload failed: ${error.message}`)
  const {
    data: { publicUrl },
  } = supabase.storage.from('slotify').getPublicUrl(path)
  return publicUrl
}
