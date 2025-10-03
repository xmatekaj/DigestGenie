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
          scope: 'openid email profile'
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
          console.error('Database error:', error)
          return false
        }
      }
      return true
    },
    
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.sub = account.providerAccountId
        token.email = profile.email
        token.name = profile.name
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
    }
  },
  
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60,
  },
  
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
