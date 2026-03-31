import { NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'
import { hasSupabaseEnv } from '@/lib/supabase/config'

export async function POST(request: Request) {
  const requestUrl = new URL(request.url)

  if (hasSupabaseEnv()) {
    const supabase = await createClient()
    await supabase.auth.signOut()
  }

  const redirectUrl = new URL('/login', requestUrl.origin)
  return NextResponse.redirect(redirectUrl)
}
