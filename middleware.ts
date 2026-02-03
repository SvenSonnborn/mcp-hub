import { NextRequest, NextResponse } from 'next/server'
import { updateSupabaseSession } from '@/lib/supabase/middleware'

const protectedRoutes = ['/dashboard', '/config', '/monitor']

const isProtectedPath = (pathname: string) =>
  protectedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSupabaseSession(request)
  const { pathname } = request.nextUrl

  const isProtected = isProtectedPath(pathname)
  const isInstallationsApi = pathname.startsWith('/api/installations')
  const isProtectedInstallationsMethod = ['POST', 'PATCH', 'DELETE'].includes(request.method)

  if (!user && (isProtected || (isInstallationsApi && isProtectedInstallationsMethod))) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
