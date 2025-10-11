// app/api/newsletters/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all newsletters
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        userNewsletterSubscriptions: {
          select: {
            newsletterId: true,
            isActive: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get all newsletters
    const newsletters = await prisma.newsletter.findMany({
      where: {
        isActive: true,
      },
      orderBy: [
        { isPredefined: 'desc' },
        { subscriberCount: 'desc' },
        { name: 'asc' },
      ],
    });

    // Map subscriptions
    const subscribedNewsletterIds = new Set(
      user.userNewsletterSubscriptions
        .filter(sub => sub.isActive)
        .map(sub => sub.newsletterId)
    );

    // Format response
    const formattedNewsletters = newsletters.map(newsletter => ({
      id: newsletter.id,
      name: newsletter.name,
      description: newsletter.description,
      senderEmail: newsletter.senderEmail,
      websiteUrl: newsletter.websiteUrl,
      logoUrl: newsletter.logoUrl,
      frequency: newsletter.frequency,
      isPredefined: newsletter.isPredefined,
      subscriberCount: newsletter.subscriberCount,
      category: newsletter.category,
      tags: newsletter.tags,
      isSubscribed: subscribedNewsletterIds.has(newsletter.id),
    }));

    return NextResponse.json(formattedNewsletters);
  } catch (error) {
    console.error('Error fetching newsletters:', error);
    return NextResponse.json(
      { error: 'Failed to fetch newsletters' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Create a new newsletter
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { name, senderEmail, description, websiteUrl, frequency } = body;

    // Validate required fields
    if (!name || !senderEmail) {
      return NextResponse.json(
        { error: 'Name and sender email are required' },
        { status: 400 }
      );
    }

    // Check if newsletter already exists
    const existingNewsletter = await prisma.newsletter.findFirst({
      where: {
        OR: [
          { senderEmail: senderEmail },
          { name: name },
        ],
      },
    });

    if (existingNewsletter) {
      return NextResponse.json(
        { error: 'Newsletter with this email or name already exists' },
        { status: 409 }
      );
    }

    // Extract domain from sender email
    const senderDomain = senderEmail.split('@')[1];

    // Create newsletter
    const newsletter = await prisma.newsletter.create({
      data: {
        name,
        senderEmail,
        senderDomain,
        description,
        websiteUrl,
        frequency: frequency || 'weekly',
        isPredefined: false,
        isActive: true,
        createdBy: user.id,
      },
    });

    // Automatically subscribe the creator
    await prisma.userNewsletterSubscription.create({
      data: {
        userId: user.id,
        newsletterId: newsletter.id,
        isActive: true,
        aiEnabled: true,
        aiSummaryEnabled: true,
        aiCategorizationEnabled: true,
      },
    });

    // Update newsletter subscriber count
    await prisma.newsletter.update({
      where: { id: newsletter.id },
      data: {
        subscriberCount: {
          increment: 1,
        },
      },
    });

    return NextResponse.json(newsletter, { status: 201 });
  } catch (error) {
    console.error('Error creating newsletter:', error);
    return NextResponse.json(
      { error: 'Failed to create newsletter' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}