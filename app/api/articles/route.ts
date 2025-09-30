// app/api/articles/route.ts - Main articles endpoint for authenticated users
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get query parameters
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const category = url.searchParams.get('category');
    const unreadOnly = url.searchParams.get('unread') === 'true';

    // Build where clause
    let whereClause: any = {
      userId: user.id
    };

    if (category && category !== 'all') {
      whereClause.aiCategory = category;
    }

    if (unreadOnly) {
      whereClause.isRead = false;
    }

    // Fetch articles
    const articles = await prisma.newsletterArticle.findMany({
      where: whereClause,
      include: {
        newsletter: {
          select: {
            name: true,
            logoUrl: true
          }
        }
      },
      orderBy: {
        processedAt: 'desc'
      },
      take: limit,
      skip: offset
    });

    // Transform articles for frontend
    const transformedArticles = articles.map(article => ({
      id: article.id,
      subject: article.title,
      aiSummary: article.aiSummary,
      content: article.content,
      newsletter: {
        name: article.newsletter.name,
        logoUrl: article.newsletter.logoUrl
      },
      interestScore: article.aiInterestScore ? Math.round(article.aiInterestScore) : undefined,
      receivedAt: article.processedAt.toISOString(),
      tags: [], // TODO: Add tags support
      aiThumbnailUrl: article.aiGeneratedThumbnail,
      isRead: article.isRead,
      isSaved: article.isSaved,
      url: article.url
    }));

    return NextResponse.json(transformedArticles);

  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}