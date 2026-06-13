import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('sessionToken')?.value
  const { pathname } = request.nextUrl

  // 1. Protected routes check
  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      // Redirect to sign-in if accessing a dashboard page without a token
      const signInUrl = new URL('/sign-in', request.url)
      return NextResponse.redirect(signInUrl)
    }
  }

  // 2. Auth routes check (redirect already logged-in users away from signup/signin)
  if (pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up') || pathname.startsWith('/verify-otp')) {
    if (token) {
      // Redirect to dashboard if logged-in user tries to open auth pages
      const dashboardUrl = new URL('/dashboard', request.url)
      return NextResponse.redirect(dashboardUrl)
    }
  }

  return NextResponse.next()
}

// Configure which paths this middleware runs on
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/sign-in',
    '/sign-up',
    '/verify-otp',
  ],
}
