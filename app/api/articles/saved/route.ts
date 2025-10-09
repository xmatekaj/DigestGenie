// app/api/articles/saved/route.ts
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

    // Get saved articles with their details
    const savedArticles = await prisma.savedArticle.findMany({
      where: {
        userId: user.id
      },
      include: {
        article: {
          include: {
            newsletter: {
              select: {
                name: true
              }
            },
            category: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        savedAt: 'desc'
      }
    });

    const formattedArticles = savedArticles.map(saved => ({
      id: saved.article.id,
      title: saved.article.title,
      summary: saved.article.summary || saved.article.content?.substring(0, 200),
      category: saved.article.category?.name || 'Uncategorized',
      newsletter: saved.article.newsletter.name,
      publishedAt: saved.article.publishedAt.toISOString(),
      savedAt: saved.savedAt.toISOString(),
      readTime: saved.article.readTime || '5 min',
      url: saved.article.url || '#',
      tags: [] // Add tags if you have a tags table
    }));

    return NextResponse.json(formattedArticles);

  } catch (error) {
    console.error('Error fetching saved articles:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}