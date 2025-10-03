// app/api/auth/[...nextauth]/route.ts - Updated with basePath support
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
  
  basePath: `${basePath}/api/auth`,
  
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('=== SIGNIN CALLBACK ===')
      console.log('Account scopes:', account?.scope)
      
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
              data: {
                updatedAt: new Date()
              }
            })
          }
        } catch (error) {
          console.error('Database error during sign in:', error)
          return false
        }
      }
      
      return true
    },
    
    async jwt({ token, account, profile, user }) {
      console.log('=== JWT CALLBACK ===')
      
      if (account && profile) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        token.tokenExpiry = account.expires_at
        token.sub = account.providerAccountId
        token.email = profile.email
        token.name = profile.name
        token.picture = (profile as any).picture
        token.scope = account.scope
        console.log('Granted scopes:', account.scope)
      }
      
      return token
    },
    
    async session({ session, token }) {
      console.log('=== SESSION CALLBACK ===')
      
      if (token) {
        session.user = {
          email: token.email!,
          name: token.name!,
        }
      }
      
      return session
    },
    
    async redirect({ url, baseUrl }) {
      console.log('=== REDIRECT CALLBACK ===')
      console.log('URL:', url)
      console.log('Base URL:', baseUrl)
      
      const redirectUrl = `${baseUrl}${basePath}/dashboard`
      console.log('Redirecting to:', redirectUrl)
      return redirectUrl
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
      name: `${basePath ? 'digestgenie.' : ''}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: basePath || '/',
        secure: process.env.NODE_ENV === 'production'
      }
    },
    callbackUrl: {
      name: `${basePath ? 'digestgenie.' : ''}next-auth.callback-url`,
      options: {
        sameSite: 'lax',
        path: basePath || '/',
        secure: process.env.NODE_ENV === 'production'
      }
    },
    csrfToken: {
      name: `${basePath ? 'digestgenie.' : ''}next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: basePath || '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  },
  
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
