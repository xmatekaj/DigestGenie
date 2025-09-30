// app/api/newsletters/process-email/route.ts - Process incoming newsletter emails
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { 
      userId, 
      newsletterName, 
      senderEmail, 
      senderDomain,
      subject, 
      frequency,
      receivedAt, 
      articles,
      processingStatus 
    } = body;

    // Find or create user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        userPreferences: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find or create newsletter
    let newsletter = await prisma.newsletter.findFirst({
      where: { 
        OR: [
          { senderEmail: senderEmail },
          { name: newsletterName }
        ]
      }
    });

    if (!newsletter) {
      newsletter = await prisma.newsletter.create({
        data: {
          name: newsletterName,
          senderEmail: senderEmail,
          senderDomain: senderDomain,
          frequency: frequency || 'weekly',
          isActive: true,
          isPredefined: false
        }
      });
    }

    // Process articles if provided
    if (articles && articles.length > 0) {
      for (const article of articles) {
        await prisma.newsletterArticle.create({
          data: {
            userId: user.id,
            newsletterId: newsletter.id,
            title: article.title || subject,
            content: article.content || '',
            url: article.url || '',
            aiSummary: article.summary || '',
            aiCategory: article.category || 'general',
            aiInterestScore: article.interestScore || 50,
            processedAt: new Date(receivedAt || Date.now()),
            isRead: false,
            isSaved: false
          }
        });
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Email processed successfully',
      newsletterId: newsletter.id,
      articlesProcessed: articles?.length || 0
    });

  } catch (error) {
    console.error('Error processing email:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}