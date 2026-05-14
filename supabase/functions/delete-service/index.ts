import { createClient } from 'jsr:@supabase/supabase-js@2'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
}

function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: CORS_HEADERS })
}

interface DeleteServicePayload {
  service_id: string
  business_id: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS })
  }

  if (req.method !== 'DELETE') {
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

    const payload: DeleteServicePayload = await req.json()

    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('id')
      .eq('id', payload.business_id)
      .eq('owner_id', user.id)
      .single()

    if (businessError || !business) {
      return json({ success: false, error: 'Business not found or access denied', code: 'FORBIDDEN' }, 403)
    }

    const { error: deleteError } = await supabase
      .from('services')
      .delete()
      .eq('id', payload.service_id)
      .eq('business_id', payload.business_id)

    if (deleteError) {
      console.error('[delete-service] DB error:', deleteError)
      return json({ success: false, error: deleteError.message, code: 'DELETE_FAILED' }, 500)
    }

    return json({ success: true, data: null })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    console.error('[delete-service] Unexpected error:', err)
    return json({ success: false, error: message, code: 'INTERNAL_ERROR' }, 500)
  }
})
