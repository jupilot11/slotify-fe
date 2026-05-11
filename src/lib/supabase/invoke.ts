import { createClient } from './client'

type Client = ReturnType<typeof createClient>
type InvokeParameters = Parameters<Client['functions']['invoke']>

const DEFAULT_TIMEOUT_MS = 15_000

export async function invokeEdgeFunction<T>(
  functionName: string,
  options?: InvokeParameters[1],
  timeoutMs = DEFAULT_TIMEOUT_MS
): Promise<T> {
  const supabase = createClient()

  const { data, error } = await Promise.race([
    supabase.functions.invoke<T>(functionName, options),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new DOMException('Request timed out', 'AbortError')), timeoutMs)
    ),
  ])

  if (error) {
    const ctx = (error as unknown as { context?: unknown }).context
    if (ctx instanceof Response) {
      const body = await ctx.json().catch(() => null)
      const msg = body?.error ?? body?.message
      if (typeof msg === 'string' && msg) throw new Error(msg)
    }
    throw error
  }

  if (!data) throw new Error(`Empty response from ${functionName}`)
  return data
}
