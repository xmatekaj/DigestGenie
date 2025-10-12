// app/api/admin/inbox/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function isAdmin(email: string): Promise<boolean> {
  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || [
    'admin@digestgenie.com',
    'matekaj@proton.me',
    'xmatekaj@gmail.com'
  ]
  return adminEmails.includes(email)
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email || !(await isAdmin(session.user.email))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch all raw emails from the system
    const rawEmails = await prisma.rawEmail.findMany({
      include: {
        user: {
          select: {
            email: true,
            name: true,
            systemEmail: true
          }
        }
      },
      orderBy: {
        receivedDate: 'desc'
      },
      take: 100 // Limit to last 100 emails
    })

    return NextResponse.json({ emails: rawEmails })
  } catch (error) {
    console.error('Error fetching inbox:', error)
    return NextResponse.json(
      { error: 'Failed to fetch inbox' },
      { status: 500 }
    )
  }
}