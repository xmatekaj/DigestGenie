// app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { prisma } from '@/lib/prisma'

const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || [
  'admin@digestgenie.com',
  'matekaj@proton.me',
  'xmatekaj@gmail.com'
];

// Generate system email from user's email
function generateSystemEmail(email: string): string {
  const emailDomain = process.env.EMAIL_DOMAIN || 'digestgenie.com'
  const username = email.split('@')[0] // Extract username before @
  return `${username}@${emailDomain}`
}

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
            // Generate system email from user's email
            const systemEmail = generateSystemEmail(profile.email!)
            
            // Create new user with auto-generated system email
            await prisma.user.create({
              data: {
                id: account.providerAccountId,
                email: profile.email!,
                name: profile.name!,
                googleId: account.providerAccountId,
                systemEmail: systemEmail,
                createdAt: new Date(),
                updatedAt: new Date()
              }
            })
            
            // Create email processing record
            await prisma.emailProcessing.create({
              data: {
                userId: account.providerAccountId,
                emailAddress: systemEmail,
                processingStatus: 'active'
              }
            })
          } else {
            // Update existing user
            await prisma.user.update({
              where: { email: profile.email! },
              data: { updatedAt: new Date() }
            })
            
            // If existing user doesn't have system email, create one
            if (!existingUser.systemEmail) {
              const systemEmail = generateSystemEmail(profile.email!)
              
              await prisma.user.update({
                where: { id: existingUser.id },
                data: { systemEmail: systemEmail }
              })
              
              // Create email processing record
              await prisma.emailProcessing.create({
                data: {
                  userId: existingUser.id,
                  emailAddress: systemEmail,
                  processingStatus: 'active'
                }
              })
            }
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
      if (token && session.user) {
        session.user.email = token.email as string
        session.user.name = token.name as string
      }
      return session
    },
    
    async redirect({ url, baseUrl }) {
      // After sign in, check if user is admin
      if (url === `${baseUrl}/dashboard` || url === baseUrl || url === `${baseUrl}/`) {
        // This will be further handled by middleware
        return `${baseUrl}/dashboard`;
      }
      
      // Allow callback URLs
      if (url.startsWith(baseUrl)) return url;
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      
      return baseUrl;
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