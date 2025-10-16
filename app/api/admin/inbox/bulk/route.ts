// app/api/admin/inbox/bulk/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function isAdmin(email: string): Promise<boolean> {
  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || []
  return adminEmails.includes(email)
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email || !(await isAdmin(session.user.email))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action, date } = await request.json()
    let count = 0

    switch (action) {
      case 'pending':
        const pendingResult = await prisma.rawEmail.deleteMany({
          where: { processed: false }
        })
        count = pendingResult.count
        break

      case 'older':
        if (!date) {
          return NextResponse.json({ error: 'Date required' }, { status: 400 })
        }
        const olderResult = await prisma.rawEmail.deleteMany({
          where: {
            receivedDate: {
              lt: new Date(date)
            }
          }
        })
        count = olderResult.count
        break

      case 'all':
        const allResult = await prisma.rawEmail.deleteMany({})
        count = allResult.count
        break

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    return NextResponse.json({ success: true, count })
  } catch (error) {
    console.error('Bulk delete error:', error)
    return NextResponse.json({ error: 'Failed to delete emails' }, { status: 500 })
  }
}