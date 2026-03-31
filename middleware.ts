import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

import { getSupabaseEnv, hasSupabaseEnv } from '@/lib/supabase/config'

const PUBLIC_AUTH_ROUTES = ['/login', '/signup', '/student-register', '/auth/callback']
const FACULTY_ALLOWED_ROUTES = ['/timetable', '/leave', '/qualifications', '/notifications', '/auth/signout']
const STUDENT_ALLOWED_ROUTES = ['/student-dashboard', '/feedback', '/auth/signout']

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  if (!hasSupabaseEnv()) {
    return response
  }

  const { url, anonKey } = getSupabaseEnv()

  if (!url || !anonKey) {
    return response
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))

        response = NextResponse.next({ request })

        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        )
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const isAuthRoute = PUBLIC_AUTH_ROUTES.some((route) => pathname.startsWith(route))

  if (!user && !isAuthRoute) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    const metadataRole = user.user_metadata?.role
    const normalizedMetadataRole =
      metadataRole === 'student' || metadataRole === 'faculty' || metadataRole === 'admin'
        ? metadataRole
        : null
    const role = profile?.role ?? normalizedMetadataRole ?? 'faculty'

    if (isAuthRoute) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.search = ''

      if (role === 'student') {
        redirectUrl.pathname = '/student-dashboard'
      } else if (role === 'faculty') {
        redirectUrl.pathname = '/timetable'
      } else {
        redirectUrl.pathname = '/'
      }

      return NextResponse.redirect(redirectUrl)
    }

    if (role === 'student') {
      const isStudentRoute = STUDENT_ALLOWED_ROUTES.some((route) => pathname.startsWith(route))
      if (!isStudentRoute) {
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = '/student-dashboard'
        redirectUrl.search = ''
        return NextResponse.redirect(redirectUrl)
      }
    }

    if (role === 'faculty') {
      const isAllowedForFaculty =
        pathname === '/' || FACULTY_ALLOWED_ROUTES.some((route) => pathname.startsWith(route))

      if (pathname === '/') {
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = '/timetable'
        redirectUrl.search = ''
        return NextResponse.redirect(redirectUrl)
      }

      if (!isAllowedForFaculty) {
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = '/timetable'
        redirectUrl.search = ''
        return NextResponse.redirect(redirectUrl)
      }
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
