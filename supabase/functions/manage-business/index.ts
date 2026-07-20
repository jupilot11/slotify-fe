import { createClient } from 'jsr:@supabase/supabase-js@2'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'PATCH, OPTIONS',
}

function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: CORS_HEADERS })
}

interface BusinessHour {
  day_of_week: number
  is_closed: boolean
  open_time: string | null
  close_time: string | null
}

interface UpdateBusinessBody {
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
  if (req.method !== 'PATCH') return json({ success: false, error: 'Method not allowed' }, 405)

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

    const url = new URL(req.url)
    const segments = url.pathname.split('/').filter(Boolean)
    const id = segments[segments.length - 1]
    if (!id) return json({ success: false, error: 'Missing business id' }, 400)

    const { data: existing, error: findError } = await supabase
      .from('businesses')
      .select('id')
      .eq('id', id)
      .eq('owner_id', user.id)
      .single()

    if (findError || !existing) return json({ success: false, error: 'Business not found' }, 404)

    const body: UpdateBusinessBody = await req.json()

    const { data: updated, error: updateError } = await supabase
      .from('businesses')
      .update({
        name: body.name,
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
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('[manage-business] update error:', updateError)
      return json({ success: false, error: updateError.message }, 500)
    }

    if (body.hours && body.hours.length > 0) {
      const hoursRows = body.hours.map((h) => ({
        business_id: id,
        day_of_week: h.day_of_week,
        is_closed: h.is_closed,
        open_time: h.open_time,
        close_time: h.close_time,
      }))
      const { error: hoursError } = await supabase
        .from('business_hours')
        .upsert(hoursRows, { onConflict: 'business_id,day_of_week' })
      if (hoursError) console.error('[manage-business] hours upsert error:', hoursError)
    }

    return json({ success: true, data: updated })
  } catch (err) {
    console.error('[manage-business] unexpected error:', err)
    return json({ success: false, error: err instanceof Error ? err.message : 'Internal server error' }, 500)
  }
})
