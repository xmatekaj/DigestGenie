// app/api/articles/saved/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Fetch only saved articles
    const articles = await prisma.newsletterArticle.findMany({
      where: {
        userId: user.id,
        isSaved: true
      },
      include: {
        newsletter: {
          select: {
            name: true,
            logoUrl: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc' // Most recently saved first
      }
    })

    // Transform to match the component's expected format
    const transformedArticles = articles.map(article => ({
      id: article.id,
      subject: article.title,
      aiGeneratedTitle: article.title,
      aiSummary: article.aiSummary,
      content: article.content,
      newsletter: {
        name: article.newsletter.name,
        logoUrl: article.newsletter.logoUrl
      },
      interestScore: article.aiInterestScore,
      receivedAt: article.processedAt.toISOString(),
      aiThumbnailUrl: article.imageUrl,
      isRead: article.isRead,
      isSaved: article.isSaved,
      url: article.url
    }))

    return NextResponse.json(transformedArticles)
  } catch (error) {
    console.error('Error fetching saved articles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch saved articles' },
      { status: 500 }
    )
  }
}