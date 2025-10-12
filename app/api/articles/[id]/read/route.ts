// app/api/articles/[id]/read/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(
  request: Request,
  context: RouteParams
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { id } = await context.params

    // Update article to mark as read
    const article = await prisma.newsletterArticle.update({
      where: {
        id: id,
        userId: user.id
      },
      data: {
        isRead: true
      }
    })

    return NextResponse.json({ success: true, article })
  } catch (error) {
    console.error('Error marking article as read:', error)
    return NextResponse.json(
      { error: 'Failed to mark article as read' },
      { status: 500 }
    )
  }
}