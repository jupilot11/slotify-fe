import { createClient } from 'jsr:@supabase/supabase-js@2'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: CORS_HEADERS })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS })
  }

  if (req.method !== 'GET') {
    return json({ success: false, error: 'Method not allowed', code: 'METHOD_NOT_ALLOWED' }, 405)
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return json({ success: false, error: 'Unauthorized', code: 'MISSING_TOKEN' }, 401)
    }

    const url = new URL(req.url)
    const serviceId = url.searchParams.get('service_id')
    if (!serviceId) {
      return json({ success: false, error: 'service_id is required', code: 'MISSING_PARAM' }, 400)
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

    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('*, businesses!inner(owner_id)')
      .eq('id', serviceId)
      .single()

    if (serviceError || !service) {
      return json({ success: false, error: 'Service not found', code: 'NOT_FOUND' }, 404)
    }

    if (service.businesses.owner_id !== user.id) {
      return json({ success: false, error: 'Access denied', code: 'FORBIDDEN' }, 403)
    }

    const { businesses: _businesses, ...serviceData } = service
    return json({ success: true, data: serviceData })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    console.error('[get-service] Unexpected error:', err)
    return json({ success: false, error: message, code: 'INTERNAL_ERROR' }, 500)
  }
})
