import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return Response.json(
        { success: false, error: 'Unauthorized', code: 'MISSING_TOKEN' },
        { status: 401, headers: corsHeaders },
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    )

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return Response.json(
        { success: false, error: 'Invalid or expired token', code: 'INVALID_TOKEN' },
        { status: 401, headers: corsHeaders },
      )
    }

    // Use service role key to bypass RLS — email_verified is a system field
    // that user-scoped policies intentionally block from being self-updated.
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const { error: updateError } = await adminClient
      .from('profiles')
      .update({ email_verified: true })
      .eq('id', user.id)

    if (updateError) {
      return Response.json(
        { success: false, error: updateError.message, code: 'UPDATE_FAILED' },
        { status: 500, headers: corsHeaders },
      )
    }

    return Response.json(
      { success: true, message: 'Email verified successfully', data: { email_verified: true } },
      { status: 200, headers: corsHeaders },
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return Response.json(
      { success: false, error: message, code: 'INTERNAL_ERROR' },
      { status: 500, headers: corsHeaders },
    )
  }
})
