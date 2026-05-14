import { createClient } from '@/lib/supabase/client'

export async function uploadBusinessImage(
  businessId: string,
  file: File,
  folder: 'logo' | 'banner' | 'images'
): Promise<string> {
  const supabase = createClient()
  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `businesses/${businessId}/${folder}/${Date.now()}.${ext}`
  const { error } = await supabase.storage.from('slotify').upload(path, file, { upsert: true })
  if (error) throw new Error(`Image upload failed: ${error.message}`)
  const { data: { publicUrl } } = supabase.storage.from('slotify').getPublicUrl(path)
  return publicUrl
}

export async function uploadBusinessImageStaging(file: File): Promise<string> {
  const supabase = createClient()
  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `businesses/staging/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const { error } = await supabase.storage.from('slotify').upload(path, file)
  if (error) throw new Error(`Image upload failed: ${error.message}`)
  const { data: { publicUrl } } = supabase.storage.from('slotify').getPublicUrl(path)
  return publicUrl
}
