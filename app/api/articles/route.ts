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

    const user = await prisma.users.findUnique({
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
    const articles = await prisma.newsletterArticles.findMany({
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
      aiGeneratedTitle: article.aiGeneratedTitle,
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

---

// app/api/articles/public/route.ts - Public articles endpoint for landing page (predefined newsletters only)
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    // Only return articles from predefined newsletters (system newsletters)
    const articles = await prisma.newsletterArticles.findMany({
      where: {
        newsletter: {
          isPredefined: true
        }
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
        processedAt: 'desc'
      },
      take: 12 // Limit to most recent articles for landing page
    });

    // Transform articles for frontend
    const transformedArticles = articles.map(article => ({
      id: article.id,
      title: article.title,
      summary: article.aiSummary || article.excerpt || 'No summary available',
      category: article.aiCategory || 'general',
      newsletter: article.newsletter.name,
      publishedAt: article.publishedAt || article.processedAt,
      readTime: '5 min read', // TODO: Calculate actual read time
      aiIcon: '🤖', // TODO: Make this dynamic based on content
      interestScore: article.aiInterestScore ? Math.round(article.aiInterestScore) : 75
    }));

    return NextResponse.json(transformedArticles);

  } catch (error) {
    console.error('Error fetching public articles:', error);
    // Return empty array instead of error for public endpoint
    return NextResponse.json([]);
  }
}

---

// app/api/articles/[id]/save/route.ts - Save/unsave articles
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.users.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const articleId = params.id;

    // Check if article belongs to user
    const article = await prisma.newsletterArticles.findFirst({
      where: {
        id: articleId,
        userId: user.id
      }
    });

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // Update saved status
    await prisma.newsletterArticles.update({
      where: { id: articleId },
      data: { isSaved: true }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error saving article:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.users.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const articleId = params.id;

    // Update saved status
    await prisma.newsletterArticles.update({
      where: { 
        id: articleId,
        userId: user.id
      },
      data: { isSaved: false }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error unsaving article:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

---

// app/api/articles/[id]/read/route.ts - Mark articles as read
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.users.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const articleId = params.id;

    // Update read status
    await prisma.newsletterArticles.update({
      where: { 
        id: articleId,
        userId: user.id
      },
      data: { isRead: true }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error marking article as read:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}