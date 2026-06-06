import type { NextAuthConfig } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import SpotifyProvider from 'next-auth/providers/spotify'

export const authConfig = {
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID ?? '',
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? '',
      allowDangerousEmailAccountLinking: true,
    }),
    SpotifyProvider({
      clientId: process.env.AUTH_SPOTIFY_ID ?? '',
      clientSecret: process.env.AUTH_SPOTIFY_SECRET ?? '',
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  pages: {
    signIn: '/login',
    signOut: '/logout',
  },
  callbacks: {
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub
      return session
    },
  },
} satisfies NextAuthConfig
