// app/api/user/system-email/route.ts - Generate and manage system emails
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { prisma } from '@/lib/prisma'
//import { generateSystemEmail } from '@/lib/email-utils'

export async function GET(request: NextRequest) {
  const session = await getServerSession()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        emailProcessing: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      systemEmail: user.systemEmail,
      processingStatus: user.emailProcessing?.[0]?.processingStatus || 'inactive'
    })
  } catch (error) {
    console.error('Error fetching system email:', error)
    return NextResponse.json({ error: 'Failed to fetch system email' }, { status: 500 })
  }
}

async function generateSystemEmail(userId: string): Promise<string> {
  // Generate a unique system email for receiving newsletters
  const randomString = Math.random().toString(36).substring(2, 10);
  return `newsletters-${userId.substring(0, 8)}-${randomString}@digestgenie.local`;
}

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Generate system email if doesn't exist
    let systemEmail = user.systemEmail;
    if (!systemEmail) {
      systemEmail = await generateSystemEmail(user.id);
      
      await prisma.user.update({
        where: { id: user.id },
        data: { systemEmail }
      });
    }

    // Create email processing record (delete old one first to avoid unique constraint issues)
    await prisma.emailProcessing.deleteMany({ 
      where: { userId: user.id } 
    });
    
    await prisma.emailProcessing.create({
      data: {
        userId: user.id,
        emailAddress: systemEmail,
        processingStatus: 'active',
        lastProcessedAt: new Date()
      }
    });

    return NextResponse.json({ systemEmail });

  } catch (error) {
    console.error('Error setting up system email:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}