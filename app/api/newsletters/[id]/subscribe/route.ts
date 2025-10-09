// app/api/newsletters/[id]/subscribe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Subscribe to newsletter
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
      include: {
        userSubscription: {
          include: {
            plan: true,
          },
        },
        userNewsletterSubscriptions: {
          where: { isActive: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const newsletterId = params.id;

    // Check newsletter exists
    const newsletter = await prisma.newsletter.findUnique({
      where: { id: newsletterId },
    });

    if (!newsletter) {
      return NextResponse.json({ error: 'Newsletter not found' }, { status: 404 });
    }

    // Check subscription limits
    const maxNewsletters = user.userSubscription?.plan.maxNewsletters || 3;
    const currentSubscriptions = user.userNewsletterSubscriptions.length;

    if (currentSubscriptions >= maxNewsletters) {
      return NextResponse.json(
        { 
          error: `You have reached your limit of ${maxNewsletters} newsletters. Upgrade to subscribe to more.`,
          upgrade: true,
        },
        { status: 403 }
      );
    }

    // Get subscription preferences from request body
    const body = await request.json();
    const {
      aiEnabled = true,
      aiSummaryEnabled = true,
      aiCategorizationEnabled = true,
      displayPreference = { type: 'cards', showImages: true },
    } = body;

    // Create or update subscription
    const subscription = await prisma.userNewsletterSubscription.upsert({
      where: {
        userId_newsletterId: {
          userId: user.id,
          newsletterId: newsletterId,
        },
      },
      create: {
        userId: user.id,
        newsletterId: newsletterId,
        isActive: true,
        aiEnabled,
        aiSummaryEnabled,
        aiCategorizationEnabled,
        displayPreference,
      },
      update: {
        isActive: true,
        aiEnabled,
        aiSummaryEnabled,
        aiCategorizationEnabled,
        displayPreference,
      },
    });

    // Update newsletter subscriber count
    await prisma.newsletter.update({
      where: { id: newsletterId },
      data: {
        subscriberCount: {
          increment: 1,
        },
      },
    });

    // Update user subscription count
    if (user.userSubscription) {
      await prisma.userSubscription.update({
        where: { id: user.userSubscription.id },
        data: {
          newslettersCount: {
            increment: 1,
          },
        },
      });
    }

    // Create usage event
    await prisma.usageEvent.create({
      data: {
        userId: user.id,
        eventType: 'newsletter_subscribed',
        eventData: { newsletterId, newsletterName: newsletter.name },
        quotaConsumed: 0,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Subscribed successfully',
      subscription,
    });
  } catch (error) {
    console.error('Error subscribing to newsletter:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Unsubscribe from newsletter
export async function DELETE(
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

    const newsletterId = params.id;

    // Deactivate subscription
    const subscription = await prisma.userNewsletterSubscription.updateMany({
      where: {
        userId: user.id,
        newsletterId: newsletterId,
      },
      data: {
        isActive: false,
      },
    });

    if (subscription.count === 0) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    // Update newsletter subscriber count
    await prisma.newsletter.update({
      where: { id: newsletterId },
      data: {
        subscriberCount: {
          decrement: 1,
        },
      },
    });

    // Update user subscription count
    await prisma.userSubscription.updateMany({
      where: { userId: user.id },
      data: {
        newslettersCount: {
          decrement: 1,
        },
      },
    });

    // Create usage event
    await prisma.usageEvent.create({
      data: {
        userId: user.id,
        eventType: 'newsletter_unsubscribed',
        eventData: { newsletterId },
        quotaConsumed: 0,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Unsubscribed successfully',
    });
  } catch (error) {
    console.error('Error unsubscribing from newsletter:', error);
    return NextResponse.json(
      { error: 'Failed to unsubscribe' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}