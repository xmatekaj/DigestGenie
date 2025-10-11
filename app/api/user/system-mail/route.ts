// app/api/user/system-email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Get system email
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

    if (!user.systemEmail) {
      return NextResponse.json(
        { systemEmail: null, message: 'System email not generated yet' },
        { status: 200 }
      );
    }

    return NextResponse.json({ systemEmail: user.systemEmail });
  } catch (error) {
    console.error('Error fetching system email:', error);
    return NextResponse.json(
      { error: 'Failed to fetch system email' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Generate system email
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

    // If user already has a system email, return it
    if (user.systemEmail) {
      return NextResponse.json({
        systemEmail: user.systemEmail,
        message: 'System email already exists',
      });
    }

    // Generate unique system email
    const emailDomain = process.env.EMAIL_DOMAIN || 'newsletters.digestgenie.local';
    
    // Generate a unique identifier based on user ID and random string
    const uniqueId = crypto
      .createHash('sha256')
      .update(user.id + Date.now().toString())
      .digest('hex')
      .substring(0, 12);

    const systemEmail = `${uniqueId}@${emailDomain}`;

    // Update user with system email
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { systemEmail },
    });

    // Create usage event
    await prisma.usageEvent.create({
      data: {
        userId: user.id,
        eventType: 'system_email_generated',
        eventData: { systemEmail },
        quotaConsumed: 0,
      },
    });

    return NextResponse.json({
      success: true,
      systemEmail: updatedUser.systemEmail,
      message: 'System email generated successfully',
    });
  } catch (error) {
    console.error('Error generating system email:', error);
    return NextResponse.json(
      { error: 'Failed to generate system email' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}