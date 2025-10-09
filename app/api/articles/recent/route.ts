// app/api/articles/recent/route.ts
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

    const searchParams = req.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '5');

    // Get most recent articles
    const articles = await prisma.article.findMany({
      where: {
        newsletter: {
          userNewsletters: {
            some: {
              userId: user.id,
              isActive: true
            }
          }
        }
      },
      include: {
        newsletter: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        publishedAt: 'desc'
      },
      take: limit
    });

    const formattedArticles = articles.map(article => ({
      id: article.id,
      title: article.title,
      newsletter: article.newsletter.name,
      publishedAt: article.publishedAt.toISOString(),
      interestScore: article.interestScore || 75
    }));

    return NextResponse.json(formattedArticles);

  } catch (error) {
    console.error('Error fetching recent articles:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}