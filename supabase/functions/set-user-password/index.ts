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
    const { email, newPassword } = await req.json()

    if (!email || !newPassword) {
      const message = 'email and newPassword are required.'
      return Response.json(
        { success: false, message, error: message },
        { status: 400, headers: corsHeaders },
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const dummyPassword = Deno.env.get('DUMMY_PASSWORD')

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey || !dummyPassword) {
      const message = 'Missing required environment variables.'
      return Response.json(
        { success: false, message, error: message },
        { status: 500, headers: corsHeaders },
      )
    }

    // Sign in with dummy password to verify the user exists and retrieve their ID.
    const authClient = createClient(supabaseUrl, supabaseAnonKey)
    const { data: signInData, error: signInError } = await authClient.auth.signInWithPassword({
      email,
      password: dummyPassword,
    })

    if (signInError || !signInData.user) {
      const message = signInError?.message ?? 'Authentication failed.'
      return Response.json(
        { success: false, message, error: message },
        { status: 401, headers: corsHeaders },
      )
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey)

    const { error: updatePasswordError } = await adminClient.auth.admin.updateUserById(
      signInData.user.id,
      { password: newPassword },
    )

    if (updatePasswordError) {
      const message = `Failed to update password: ${updatePasswordError.message}`
      return Response.json(
        { success: false, message, error: message },
        { status: 500, headers: corsHeaders },
      )
    }

    const { error: profileUpdateError } = await adminClient
      .from('profiles')
      .update({ password_set: true })
      .eq('id', signInData.user.id)

    if (profileUpdateError) {
      const message = `Password updated but failed to update profile: ${profileUpdateError.message}`
      return Response.json(
        { success: false, message, error: message },
        { status: 500, headers: corsHeaders },
      )
    }

    return Response.json(
      { success: true, message: 'Password updated successfully.' },
      { status: 200, headers: corsHeaders },
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected server error.'
    return Response.json(
      { success: false, message, error: message },
      { status: 500, headers: corsHeaders },
    )
  }
})
