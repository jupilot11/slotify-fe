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

    const authClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    )
    const { data: { user }, error: userError } = await authClient.auth.getUser()
    if (userError || !user) {
      return json({ success: false, error: 'Invalid or expired token', code: 'INVALID_TOKEN' }, 401)
    }

    const url = new URL(req.url)
    const id = url.searchParams.get('id')
    if (!id) {
      return json({ success: false, error: 'Missing id parameter', code: 'MISSING_PARAM' }, 400)
    }

    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    )

    const { data: biz, error: bizError } = await adminClient
      .from('businesses')
      .select('*, business_categories(name)')
      .eq('id', id)
      .maybeSingle()

    if (bizError) {
      console.error('[admin-get-business] DB error:', bizError)
      return json({ success: false, error: bizError.message, code: 'QUERY_FAILED' }, 500)
    }
    if (!biz) {
      return json({ success: false, error: 'Business not found', code: 'NOT_FOUND' }, 404)
    }

    const [
      { data: profile },
      { count: servicesCount },
      { count: bookingsCount },
    ] = await Promise.all([
      adminClient.from('profiles').select('id, full_name, email, contact_number').eq('id', biz.owner_id).maybeSingle(),
      adminClient.from('services').select('id', { count: 'exact', head: true }).eq('business_id', id),
      adminClient.from('bookings').select('id', { count: 'exact', head: true }).eq('business_id', id),
    ])

    const { business_categories, ...bizRest } = biz
    const cats = business_categories as { name: string } | null
    const prof = profile as { full_name: string | null; email: string | null; contact_number: string | null } | null

    return json({
      success: true,
      data: {
        ...bizRest,
        category_name: cats?.name ?? null,
        owner_name: prof?.full_name ?? null,
        email: prof?.email ?? null,
        owner_phone: prof?.contact_number ?? null,
        services_count: servicesCount ?? 0,
        bookings_count: bookingsCount ?? 0,
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    console.error('[admin-get-business] Unexpected error:', err)
    return json({ success: false, error: message, code: 'INTERNAL_ERROR' }, 500)
  }
})
