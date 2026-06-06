import { NextRequest, NextResponse } from 'next/server'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const allowedPaths = ['/', '/login', '/logout', '/dashboard']

  const isAllowed = allowedPaths.some((path) =>
    path === '/' ? pathname === '/' : pathname.startsWith(path)
  )

  if (!isAllowed) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.[^/]+$).*)'],
}