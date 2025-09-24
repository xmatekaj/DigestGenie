// app/api/gmail/auth-status/route.ts - Check Gmail authentication status
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ isAuthenticated: false }, { status: 401 })
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        accessToken: true,
        refreshToken: true,
        tokenExpiry: true,
        gmailSyncEnabled: true,
        lastGmailSync: true
      }
    })

    if (!user) {
      return NextResponse.json({ isAuthenticated: false }, { status: 404 })
    }

    // Check if user has Gmail tokens and they're not expired
    const hasValidTokens = user.accessToken && user.refreshToken
    const isTokenValid = user.tokenExpiry ? new Date() < new Date(user.tokenExpiry) : false

    return NextResponse.json({
      isAuthenticated: hasValidTokens && (isTokenValid || user.refreshToken), // Can refresh if expired
      syncEnabled: user.gmailSyncEnabled || false,
      lastSync: user.lastGmailSync,
      tokenExpiry: user.tokenExpiry,
      needsReauth: hasValidTokens && !isTokenValid && !user.refreshToken
    })

  } catch (error) {
    console.error('Gmail auth status error:', error)
    return NextResponse.json({ 
      isAuthenticated: false, 
      error: 'Failed to check authentication status' 
    }, { status: 500 })
  }
}