// app/api/auth/[...nextauth]/route.ts - Debug version
import NextAuth, { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      console.log('=== SIGNIN CALLBACK ===')
      console.log('User:', user)
      console.log('Account:', account)
      console.log('Profile:', profile)
      return true
    },
    async jwt({ token, account, profile, user }) {
      console.log('=== JWT CALLBACK ===')
      console.log('Token:', token)
      console.log('Account:', account)
      console.log('Profile:', profile)
      console.log('User:', user)
      
      if (account && profile) {
        token.accessToken = account.access_token
        token.sub = account.providerAccountId
        token.email = profile.email
        token.name = profile.name
        token.picture = (profile as any).picture
        console.log('Updated token:', token)
      }
      return token
    },
    async session({ session, token, user }) {
      console.log('=== SESSION CALLBACK ===')
      console.log('Session input:', session)
      console.log('Token input:', token)
      console.log('User input:', user)
      
      if (token) {
        session.user = {
          id: token.sub!,
          email: token.email!,
          name: token.name!,
          image: token.picture as string,
        }
        session.accessToken = token.accessToken
        console.log('Updated session:', session)
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
        secure: false // Set to false for localhost
      }
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true, // Enable all debug logs
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }