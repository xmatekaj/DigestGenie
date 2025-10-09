// app/api/saved-articles/route.ts
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

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get all saved articles
    const savedArticles = await prisma.savedArticle.findMany({
      where: {
        userId: user.id,
      },
      include: {
        article: {
          include: {
            newsletter: {
              select: {
                id: true,
                name: true,
                logoUrl: true,
              },
            },
          },
        },
        folder: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true,
          },
        },
      },
      orderBy: {
        savedAt: 'desc',
      },
    });

    // Format response
    const formattedArticles = savedArticles.map(saved => ({
      id: saved.id,
      article: {
        id: saved.article.id,
        subject: saved.article.subject,
        aiGeneratedTitle: saved.article.aiGeneratedTitle,
        aiSummary: saved.article.aiSummary,
        url: saved.article.url,
        newsletter: saved.article.newsletter,
        publishedAt: saved.article.publishedAt?.toISOString() || saved.article.createdAt.toISOString(),
      },
      notes: saved.notes,
      tags: saved.tags,
      folder: saved.folder,
      savedAt: saved.savedAt.toISOString(),
    }));

    return NextResponse.json(formattedArticles);
  } catch (error) {
    console.error('Error fetching saved articles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch saved articles' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}