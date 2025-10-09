// app/api/user/subscriptions/route.ts
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

    // Get all active subscriptions
    const subscriptions = await prisma.userNewsletterSubscription.findMany({
      where: {
        userId: user.id,
        isActive: true,
      },
      include: {
        newsletter: true,
      },
      orderBy: {
        subscribedAt: 'desc',
      },
    });

    // Format response
    const formattedSubscriptions = subscriptions.map(sub => ({
      id: sub.newsletter.id,
      name: sub.newsletter.name,
      description: sub.newsletter.description,
      senderEmail: sub.newsletter.senderEmail,
      websiteUrl: sub.newsletter.websiteUrl,
      logoUrl: sub.newsletter.logoUrl,
      frequency: sub.newsletter.frequency,
      isPredefined: sub.newsletter.isPredefined,
      subscriberCount: sub.newsletter.subscriberCount,
      category: sub.newsletter.category,
      tags: sub.newsletter.tags,
      isSubscribed: true,
      subscription: {
        id: sub.id,
        isActive: sub.isActive,
        aiEnabled: sub.aiEnabled,
        aiSummaryEnabled: sub.aiSummaryEnabled,
        aiCategorizationEnabled: sub.aiCategorizationEnabled,
        subscribedAt: sub.subscribedAt.toISOString(),
      },
    }));

    return NextResponse.json(formattedSubscriptions);
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}