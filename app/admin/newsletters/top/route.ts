// app/api/admin/newsletters/top/route.ts - Top newsletters endpoint
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function isAdmin(email: string): Promise<boolean> {
  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || [
    'admin@digestgenie.com',
    'matekaj@proton.me'
  ];
  return adminEmails.includes(email);
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email || !(await isAdmin(session.user.email))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch newsletters with subscriber count
    const topNewsletters = await prisma.newsletters.findMany({
      take: 10,
      select: {
        id: true,
        name: true,
        sender_email: true,
        updated_at: true,
        _count: {
          select: {
            userNewsletters: true
          }
        }
      },
      orderBy: {
        userNewsletters: {
          _count: 'desc'
        }
      }
    });

    // Transform the data to match the expected format
    const transformedNewsletters = topNewsletters.map(newsletter => ({
      id: newsletter.id,
      name: newsletter.name,
      senderEmail: newsletter.sender_email,
      subscriberCount: newsletter._count.userNewsletters,
      lastProcessed: newsletter.updated_at.toISOString()
    }));

    return NextResponse.json(transformedNewsletters);
  } catch (error) {
    console.error('Error fetching top newsletters:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}