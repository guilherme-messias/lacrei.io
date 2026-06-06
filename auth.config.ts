import type { NextAuthConfig } from 'next-auth'
import Google from 'next-auth/providers/google'
import Spotify from 'next-auth/providers/spotify'

export const authConfig = {
  providers: [Google, Spotify],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub
      return session
    },
  },
} satisfies NextAuthConfig
