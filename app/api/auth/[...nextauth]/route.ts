// app/api/auth/[...nextauth]/route.ts - Updated with Gmail scopes
import NextAuth, { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { prisma } from '@/lib/prisma'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          // Add Gmail scopes for email access
          scope: [
            'openid',
            'email', 
            'profile',
            'https://www.googleapis.com/auth/gmail.readonly', // Read Gmail emails
            'https://www.googleapis.com/auth/gmail.metadata'   // Access email metadata
          ].join(' ')
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('=== SIGNIN CALLBACK ===')
      console.log('Account scopes:', account?.scope)
      
      if (account && profile) {
        try {
          // Find or create user in database
          const existingUser = await prisma.user.findUnique({
            where: { email: profile.email! }
          })

          if (!existingUser) {
            // Create new user
            await prisma.user.create({
              data: {
                id: account.providerAccountId,
                email: profile.email!,
                name: profile.name!,
                googleId: account.providerAccountId,
                // Store access token for Gmail access
                createdAt: new Date(),
                updatedAt: new Date()
              }
            })
          } else {
            // Update existing user's tokens
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
        token.scope = account.scope // Store granted scopes
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
      
      // Always redirect to dashboard after successful login
      const redirectUrl = `${baseUrl}/dashboard`
      console.log('Redirecting to:', redirectUrl)
      return redirectUrl
    }
  },
  
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  },
  
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }