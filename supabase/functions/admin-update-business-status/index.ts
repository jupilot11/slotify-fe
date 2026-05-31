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

  if (req.method !== 'POST') {
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

    const body = await req.json()
    const { businessId, status, reason } = body as { businessId?: string; status?: string; reason?: string }

    if (!businessId || (status !== 'approved' && status !== 'rejected')) {
      return json({ success: false, error: 'businessId and status (approved|rejected) are required', code: 'INVALID_PARAMS' }, 400)
    }

    if (status === 'rejected' && !reason?.trim()) {
      return json({ success: false, error: 'reason is required when rejecting a business', code: 'INVALID_PARAMS' }, 400)
    }

    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    )

    const patch: Record<string, string> = { status }
    if (status === 'rejected' && reason) patch.rejection_reason = reason.trim()

    const { data: updated, error: updateError } = await adminClient
      .from('businesses')
      .update(patch)
      .eq('id', businessId)
      .select('id, name, slug, status, created_at')
      .single()

    if (updateError) {
      console.error('[admin-update-business-status] DB error:', updateError)
      return json({ success: false, error: updateError.message, code: 'UPDATE_FAILED' }, 500)
    }

    return json({ success: true, data: updated })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    console.error('[admin-update-business-status] Unexpected error:', err)
    return json({ success: false, error: message, code: 'INTERNAL_ERROR' }, 500)
  }
})
