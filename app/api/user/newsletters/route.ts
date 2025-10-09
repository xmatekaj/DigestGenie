// app/api/user/newsletters/route.ts
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

    // Get user's subscribed newsletters
    const userNewsletters = await prisma.userNewsletter.findMany({
      where: {
        userId: user.id,
        isActive: true
      },
      include: {
        newsletter: {
          include: {
            category: {
              select: {
                name: true
              }
            },
            _count: {
              select: {
                userNewsletters: true
              }
            }
          }
        }
      },
      orderBy: {
        subscribedAt: 'desc'
      }
    });

    const formattedNewsletters = userNewsletters.map(un => ({
      id: un.newsletter.id,
      name: un.newsletter.name,
      description: un.newsletter.description || 'No description available',
      senderEmail: un.newsletter.senderEmail,
      category: un.newsletter.category?.name || 'General',
      subscriberCount: un.newsletter._count.userNewsletters,
      frequency: un.newsletter.frequency || 'Weekly',
      isSubscribed: true,
      isPredefined: un.newsletter.isPredefined,
      subscribedAt: un.subscribedAt.toISOString()
    }));

    return NextResponse.json(formattedNewsletters);

  } catch (error) {
    console.error('Error fetching user newsletters:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}