import NextAuth from 'next-auth'
import { authConfig } from './auth.config'
import { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const { auth: middleware } = NextAuth(authConfig)

  const config = {
    matcher: [
      '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.[^/]+$|privacy-policy|data-deletion).*)',
    ],
  }
}
