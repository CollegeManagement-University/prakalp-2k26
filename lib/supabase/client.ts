import { createBrowserClient } from '@supabase/ssr'

import { getSupabaseEnv } from '@/lib/supabase/config'

export function createClient() {
  const { url, anonKey } = getSupabaseEnv()

  if (!url || !anonKey) {
    throw new Error('Missing Supabase environment variables for browser client.')
  }

  return createBrowserClient(url, anonKey)
}
