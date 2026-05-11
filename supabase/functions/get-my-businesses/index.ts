import { createClient } from 'jsr:@supabase/supabase-js@2'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: CORS_HEADERS })
}

interface Business {
  id: string
  name: string
  slug: string
  city: string | null
  status: string
  logo_url: string | null
  category_id: string | null
  business_categories: { name: string } | null
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

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    )

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return json({ success: false, error: 'Invalid or expired token', code: 'INVALID_TOKEN' }, 401)
    }

    const { data: businesses, error: dbError } = await supabase
      .from('businesses')
      .select('id, name, slug, city, status, logo_url, category_id, business_categories(name)')
      .eq('owner_id', user.id)

    if (dbError) {
      console.error('[get-my-businesses] DB error:', dbError)
      return json({ success: false, error: dbError.message, code: 'QUERY_FAILED' }, 500)
    }

    return json({ success: true, data: (businesses ?? []) as Business[] })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    console.error('[get-my-businesses] Unexpected error:', err)
    return json({ success: false, error: message, code: 'INTERNAL_ERROR' }, 500)
  }
})
