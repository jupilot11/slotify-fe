import { createClient } from 'jsr:@supabase/supabase-js@2'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: CORS_HEADERS })
}

interface CreateServicePayload {
  business_id: string
  name: string
  slug: string
  description?: string | null
  image_url?: string | null
  service_type: 'appointment' | 'time_slot'
  min_duration_minutes: number
  max_duration_minutes?: number | null
  duration_note?: string | null
  buffer_time_minutes?: number
  pricing_type: 'fixed' | 'range' | 'on_request'
  price_amount?: number | null
  price_min?: number | null
  price_max?: number | null
  price_note?: string | null
  currency?: string
  max_capacity?: number
  requires_confirmation: boolean
  is_active: boolean
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS })
  }

  if (req.method !== 'POST') {
    return json({ success: false, error: 'Method not allowed', code: 'METHOD_NOT_ALLOWED' }, 405)
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return json({ success: false, error: 'Unauthorized', code: 'MISSING_TOKEN' }, 401)
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    )

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return json({ success: false, error: 'Invalid or expired token', code: 'INVALID_TOKEN' }, 401)
    }

    const payload: CreateServicePayload = await req.json()

    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('id')
      .eq('id', payload.business_id)
      .eq('owner_id', user.id)
      .single()

    if (businessError || !business) {
      return json({ success: false, error: 'Business not found or access denied', code: 'FORBIDDEN' }, 403)
    }

    const { data: service, error: insertError } = await supabase
      .from('services')
      .insert({
        business_id: payload.business_id,
        name: payload.name,
        slug: payload.slug,
        description: payload.description ?? null,
        image_url: payload.image_url ?? null,
        service_type: payload.service_type,
        min_duration_minutes: payload.min_duration_minutes,
        max_duration_minutes: payload.max_duration_minutes ?? null,
        duration_note: payload.duration_note ?? null,
        buffer_time_minutes: payload.buffer_time_minutes ?? 0,
        pricing_type: payload.pricing_type,
        price_amount: payload.pricing_type === 'fixed' ? (payload.price_amount ?? null) : null,
        price_min: payload.pricing_type === 'range' ? (payload.price_min ?? null) : null,
        price_max: payload.pricing_type === 'range' ? (payload.price_max ?? null) : null,
        price_note: payload.price_note ?? null,
        currency: payload.currency ?? 'PHP',
        max_capacity: payload.max_capacity ?? 1,
        requires_confirmation: payload.requires_confirmation,
        is_active: payload.is_active,
      })
      .select()
      .single()

    if (insertError) {
      console.error('[create-service] DB error:', insertError)
      return json({ success: false, error: insertError.message, code: 'INSERT_FAILED' }, 500)
    }

    return json({ success: true, data: service }, 201)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    console.error('[create-service] Unexpected error:', err)
    return json({ success: false, error: message, code: 'INTERNAL_ERROR' }, 500)
  }
})
