// app/api/articles/feed/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

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
    const searchParams = req.nextUrl.searchParams;
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Get articles from user's subscribed newsletters
    const articles = await prisma.article.findMany({
      where: {
        newsletter: {
          userNewsletters: {
            some: {
              userId: user.id,
              isActive: true
            }
          }
        },
        ...(category && category !== 'all' ? { categoryId: category } : {})
      },
      include: {
        newsletter: {
          select: {
            name: true,
            id: true
          }
        },
        category: {
          select: {
            name: true
          }
        },
        savedBy: {
          where: { userId: user.id },
          select: { id: true }
        },
        readBy: {
          where: { userId: user.id },
          select: { id: true }
        }
      },
      orderBy: {
        publishedAt: 'desc'
      },
      take: limit
    });

    // Format articles for frontend
    const formattedArticles = articles.map(article => ({
      id: article.id,
      title: article.title,
      summary: article.summary || article.content?.substring(0, 200),
      category: article.category?.name || 'Uncategorized',
      newsletter: article.newsletter.name,
      publishedAt: article.publishedAt.toISOString(),
      readTime: article.readTime || '5 min',
      isRead: article.readBy.length > 0,
      isSaved: article.savedBy.length > 0,
      interestScore: article.interestScore || 75
    }));

    return NextResponse.json(formattedArticles);

  } catch (error) {
    console.error('Error fetching articles feed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}