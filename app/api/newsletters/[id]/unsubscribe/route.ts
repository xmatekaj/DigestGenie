// app/api/newsletters/[id]/unsubscribe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const newsletterId = params.id;

    // Update subscription to inactive (soft delete)
    await prisma.userNewsletter.updateMany({
      where: {
        userId: user.id,
        newsletterId: newsletterId
      },
      data: {
        isActive: false,
        unsubscribedAt: new Date()
      }
    });

    return NextResponse.json({ message: 'Successfully unsubscribed' });

  } catch (error) {
    console.error('Error unsubscribing from newsletter:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}