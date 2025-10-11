// app/api/articles/[id]/read/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const articleId = params.id;

    // Update article as read
    const article = await prisma.newsletterArticle.updateMany({
      where: {
        id: articleId,
        userId: user.id,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    if (article.count === 0) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // Track article view for analytics
    await prisma.articleView.create({
      data: {
        userId: user.id,
        articleId: articleId,
        viewedAt: new Date(),
      },
    });

    // Create usage event
    await prisma.usageEvent.create({
      data: {
        userId: user.id,
        eventType: 'article_read',
        eventData: { articleId },
        quotaConsumed: 0,
      },
    });

    return NextResponse.json({ success: true, message: 'Article marked as read' });
  } catch (error) {
    console.error('Error marking article as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark article as read' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}