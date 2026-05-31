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

    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    )

    const url = new URL(req.url)
    const search = url.searchParams.get('search') ?? ''
    const statusFilter = url.searchParams.get('status') ?? ''
    const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') ?? '20', 10)))
    const offset = (page - 1) * limit

    // Data query — no count here to avoid JOIN inflating the count
    let bizQuery = adminClient
      .from('businesses')
      .select('id, name, slug, status, created_at, phone, owner_id, business_categories(name)')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const VALID_STATUSES = ['approved', 'pending', 'rejected', 'inactive']

    if (search) bizQuery = bizQuery.ilike('name', `%${search}%`)
    if (VALID_STATUSES.includes(statusFilter)) {
      bizQuery = bizQuery.eq('status', statusFilter)
    }

    // Separate count queries on the bare businesses table — accurate and fast
    let filteredCountQuery = adminClient.from('businesses').select('id', { count: 'exact', head: true })
    if (search) filteredCountQuery = filteredCountQuery.ilike('name', `%${search}%`)
    if (VALID_STATUSES.includes(statusFilter)) {
      filteredCountQuery = filteredCountQuery.eq('status', statusFilter)
    }

    const [
      { data: bizRows, error: bizError },
      { count: filteredCount, error: countError },
    ] = await Promise.all([
      bizQuery,
      filteredCountQuery,
    ])

    if (bizError || countError) {
      const err = bizError ?? countError
      console.error('[admin-get-businesses] DB error:', err)
      return json({ success: false, error: err!.message, code: 'QUERY_FAILED' }, 500)
    }

    const rows = bizRows ?? []
    const ownerIds = [...new Set(rows.map((b: { owner_id: string }) => b.owner_id))]

    const profileMap: Record<string, { full_name: string | null; email: string | null }> = {}
    if (ownerIds.length > 0) {
      const { data: profiles } = await adminClient
        .from('profiles')
        .select('id, full_name, email')
        .in('id', ownerIds)
      for (const p of (profiles ?? [])) {
        profileMap[(p as { id: string }).id] = p as { full_name: string | null; email: string | null }
      }
    }

    const businesses = rows.map((b: Record<string, unknown>) => {
      const cats = b.business_categories as { name: string } | null
      const ownerId = b.owner_id as string
      const prof = profileMap[ownerId] ?? null
      return {
        id: b.id,
        name: b.name,
        slug: b.slug,
        status: b.status,
        created_at: b.created_at,
        phone: b.phone ?? null,
        category_name: cats?.name ?? null,
        owner_name: prof?.full_name ?? null,
        email: prof?.email ?? null,
      }
    })

    return json({
      success: true,
      data: businesses,
      total_filtered: filteredCount ?? 0,
      page,
      limit,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    console.error('[admin-get-businesses] Unexpected error:', err)
    return json({ success: false, error: message, code: 'INTERNAL_ERROR' }, 500)
  }
})
