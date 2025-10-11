// app/api/articles/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const filter = searchParams.get('filter') || 'all'; // all, unread, read
    const sort = searchParams.get('sort') || 'newest'; // newest, oldest, interest
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where clause
    const where: any = {
      userId: user.id,
    };

    if (filter === 'unread') {
      where.isRead = false;
    } else if (filter === 'read') {
      where.isRead = true;
    }

    // Build orderBy clause
    let orderBy: any = {};
    switch (sort) {
      case 'oldest':
        orderBy = { publishedAt: 'asc' };
        break;
      case 'interest':
        orderBy = { aiInterestScore: 'desc' };
        break;
      case 'newest':
      default:
        orderBy = { publishedAt: 'desc' };
        break;
    }

    // Fetch articles
    const articles = await prisma.newsletterArticle.findMany({
      where,
      orderBy,
      take: limit,
      skip: offset,
      include: {
        newsletter: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
          },
        },
      },
    });

    // Format the response
    const formattedArticles = articles.map(article => ({
      id: article.id,
      subject: article.subject,
      aiGeneratedTitle: article.aiGeneratedTitle,
      aiSummary: article.aiSummary,
      content: article.content,
      htmlContent: article.htmlContent,
      url: article.url,
      newsletter: article.newsletter,
      aiInterestScore: article.aiInterestScore,
      publishedAt: article.publishedAt?.toISOString() || article.createdAt.toISOString(),
      aiTags: article.aiTags,
      aiGeneratedThumbnail: article.aiGeneratedThumbnail,
      isRead: article.isRead,
      isSaved: article.isSaved,
      readAt: article.readAt?.toISOString(),
    }));

    return NextResponse.json(formattedArticles);
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}