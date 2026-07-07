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
    const { email, site_url } = await req.json()

    if (!email || !site_url) {
      return Response.json(
        { success: false, error: 'email and site_url are required.' },
        { status: 400, headers: corsHeaders },
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')

    if (!supabaseUrl || !supabaseAnonKey) {
      return Response.json(
        { success: false, error: 'Missing required environment variables.' },
        { status: 500, headers: corsHeaders },
      )
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${site_url}/auth/callback`,
    })

    // Always return success — never reveal whether the email exists.
    return Response.json(
      { success: true },
      { status: 200, headers: corsHeaders },
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected server error.'
    return Response.json(
      { success: false, error: message },
      { status: 500, headers: corsHeaders },
    )
  }
})
