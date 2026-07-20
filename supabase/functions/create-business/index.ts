import { createClient } from 'jsr:@supabase/supabase-js@2'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: CORS_HEADERS })
}

function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '-')
  const suffix = Math.random().toString(36).slice(2, 7)
  return `${base}-${suffix}`
}

interface BusinessHour {
  day_of_week: number
  is_closed: boolean
  open_time: string | null
  close_time: string | null
}

interface CreateBusinessBody {
  name: string
  category_id?: string
  description?: string
  email?: string
  phone?: string
  website_url?: string
  address?: string
  city?: string
  province?: string
  postal_code?: string
  lat?: number
  lng?: number
  logo_url?: string
  banner_url?: string
  image_urls?: string[]
  hours?: BusinessHour[]
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS_HEADERS })
  if (req.method !== 'POST') return json({ success: false, error: 'Method not allowed' }, 405)

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return json({ success: false, error: 'Unauthorized' }, 401)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return json({ success: false, error: 'Unauthorized' }, 401)

    const body: CreateBusinessBody = await req.json()
    if (!body.name?.trim()) return json({ success: false, error: 'Business name is required' }, 400)

    const slug = generateSlug(body.name)

    const { data: business, error: insertError } = await supabase
      .from('businesses')
      .insert({
        name: body.name.trim(),
        slug,
        owner_id: user.id,
        category_id: body.category_id ?? null,
        description: body.description ?? null,
        email: body.email ?? null,
        phone: body.phone ?? null,
        website_url: body.website_url ?? null,
        address: body.address ?? null,
        city: body.city ?? null,
        province: body.province ?? null,
        postal_code: body.postal_code ?? null,
        latitude: body.lat ?? null,
        longitude: body.lng ?? null,
        logo_url: body.logo_url ?? null,
        banner_url: body.banner_url ?? null,
        image_urls: body.image_urls ?? [],
        status: 'pending',
      })
      .select('id, name, slug')
      .single()

    if (insertError || !business) {
      console.error('[create-business] insert error:', insertError)
      return json({ success: false, error: insertError?.message ?? 'Failed to create business' }, 500)
    }

    if (body.hours && body.hours.length > 0) {
      const hoursRows = body.hours.map((h) => ({
        business_id: business.id,
        day_of_week: h.day_of_week,
        is_closed: h.is_closed,
        open_time: h.open_time,
        close_time: h.close_time,
      }))
      const { error: hoursError } = await supabase.from('business_hours').insert(hoursRows)
      if (hoursError) console.error('[create-business] hours insert error:', hoursError)
    }

    return json({ message: 'Business created', data: { id: business.id, name: business.name, slug: business.slug } })
  } catch (err) {
    console.error('[create-business] unexpected error:', err)
    return json({ success: false, error: err instanceof Error ? err.message : 'Internal server error' }, 500)
  }
})
