// app/api/auth/[...nextauth]/route.ts - Fixed with proper basePath cookie handling
import NextAuth, { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { prisma } from '@/lib/prisma'

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: [
            'openid',
            'email', 
            'profile',
            'https://www.googleapis.com/auth/gmail.readonly',
            'https://www.googleapis.com/auth/gmail.metadata'
          ].join(' ')
        }
      }
    })
  ],
  
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account && profile) {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: profile.email! }
          })
          if (!existingUser) {
            await prisma.user.create({
              data: {
                id: account.providerAccountId,
                email: profile.email!,
                name: profile.name!,
                googleId: account.providerAccountId,
                createdAt: new Date(),
                updatedAt: new Date()
              }
            })
          } else {
            await prisma.user.update({
              where: { email: profile.email! },
              data: { updatedAt: new Date() }
            })
          }
        } catch (error) {
          console.error('Database error during sign in:', error)
          return false
        }
      }
      return true
    },
    
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        token.tokenExpiry = account.expires_at
        token.sub = account.providerAccountId
        token.email = profile.email
        token.name = profile.name
        token.picture = (profile as any).picture
        token.scope = account.scope
      }
      return token
    },
    
    async session({ session, token }) {
      if (token) {
        session.user = {
          email: token.email!,
          name: token.name!,
        }
      }
      return session
    },
    
    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) return `${baseUrl}${url}`
      if (url.startsWith(baseUrl)) return url
      return `${baseUrl}${basePath}/dashboard`
    }
  },
  
  pages: {
    signIn: `${basePath}/auth/signin`,
    error: `${basePath}/auth/error`,
  },
  
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60,
  },
  
  cookies: {
    sessionToken: {
      name: basePath ? `__Secure-next-auth.session-token` : `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: basePath || '/',
        secure: true
      }
    },
    callbackUrl: {
      name: basePath ? `__Host-next-auth.callback-url` : `next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: basePath || '/',
        secure: true
      }
    },
    csrfToken: {
      name: basePath ? `__Host-next-auth.csrf-token` : `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: basePath || '/',
        secure: true
      }
    }
  },
  
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
