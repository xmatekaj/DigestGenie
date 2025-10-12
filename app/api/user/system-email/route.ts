// app/api/user/system-email/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        emailProcessing: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      systemEmail: user.systemEmail,
      processingStatus: user.emailProcessing?.[0]?.processingStatus || 'inactive'
    })
  } catch (error) {
    console.error('Error fetching system email:', error)
    return NextResponse.json(
      { error: 'Failed to fetch system email' },
      { status: 500 }
    )
  }
}