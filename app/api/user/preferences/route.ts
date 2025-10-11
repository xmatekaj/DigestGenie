// app/api/user/preferences/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get user preferences
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        userPreferences: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create default preferences if they don't exist
    if (!user.userPreferences) {
      const preferences = await prisma.userPreferences.create({
        data: {
          userId: user.id,
          globalAiEnabled: true,
          aiSummaryLength: 'medium',
          aiInterestThreshold: 0.5,
          digestFrequency: 'daily',
          digestTime: '08:00:00',
          digestTimezone: 'UTC',
          digestEnabled: true,
          defaultView: 'cards',
          articlesPerPage: 20,
          showReadArticles: false,
          darkMode: false,
          compactMode: false,
          defaultSort: 'newest',
          groupByNewsletter: false,
          emailNotifications: true,
          pushNotifications: false,
        },
      });

      return NextResponse.json(preferences);
    }

    return NextResponse.json(user.userPreferences);
  } catch (error) {
    console.error('Error fetching preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Update user preferences
export async function PUT(request: NextRequest) {
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

    // Update or create preferences
    const preferences = await prisma.userPreferences.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        ...body,
      },
      update: body,
    });

    // Create usage event
    await prisma.usageEvent.create({
      data: {
        userId: user.id,
        eventType: 'preferences_updated',
        eventData: { changedFields: Object.keys(body) },
        quotaConsumed: 0,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Preferences updated',
      preferences,
    });
  } catch (error) {
    console.error('Error updating preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}