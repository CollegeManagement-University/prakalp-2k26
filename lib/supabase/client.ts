import { createBrowserClient } from '@supabase/ssr'

import { getSupabaseEnv } from '@/lib/supabase/config'
import type { Database } from '@/lib/supabase/database.types'

export function createClient() {
  const { url, anonKey } = getSupabaseEnv()

  if (!url || !anonKey) {
    throw new Error('Missing Supabase environment variables for browser client.')
  }

  return createBrowserClient<Database>(url, anonKey)
}
