import { createClient } from './client'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

interface AdminFetchInit {
  method?: string
  query?: Record<string, string>
  body?: unknown
  headers?: Record<string, string>
}

export async function adminFetch<T>(functionName: string, init: AdminFetchInit = {}): Promise<T> {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  const url = new URL(`${SUPABASE_URL}/functions/v1/${functionName}`)
  if (init.query) {
    for (const [k, v] of Object.entries(init.query)) {
      if (v !== '' && v !== undefined) url.searchParams.set(k, v)
    }
  }

  const res = await fetch(url.toString(), {
    method: init.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${session?.access_token ?? ''}`,
      ...init.headers,
    },
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
  })

  const payload = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error((payload as { error?: string }).error ?? `Request failed with status ${res.status}`)
  }

  return payload as T
}
