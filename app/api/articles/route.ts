// /app/api/articles/route.ts - Articles API
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const session = await getServerSession()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const category = searchParams.get('category')
  const newsletter = searchParams.get('newsletter')
  const minScore = parseInt(searchParams.get('minScore') || '0')

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  const where = {
    userId: user!.id,
    processingStatus: 'completed',
    ...(category && { aiCategory: { name: category } }),
    ...(newsletter && { newsletter: { name: newsletter } }),
    aiInterestScore: { gte: minScore },
  }

  const articles = await prisma.article.findMany({
    where,
    include: {
      newsletter: {
        select: { name: true, logoUrl: true }
      },
      aiCategory: {
        select: { name: true, color: true }
      }
    },
    orderBy: [
      { aiInterestScore: 'desc' },
      { receivedAt: 'desc' }
    ],
    skip: (page - 1) * limit,
    take: limit,
  })

  const total = await prisma.article.count({ where })
  const hasNextPage = total > page * limit

  return NextResponse.json({
    articles,
    pagination: {
      page,
      limit,
      total,
      hasNextPage,
      nextPage: hasNextPage ? page + 1 : null,
    }
  })
}