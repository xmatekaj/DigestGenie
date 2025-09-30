// app/api/admin/users/recent/route.ts - Recent users endpoint
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

    // Fetch recent users with their newsletter count
    const recentUsers = await prisma.user.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        _count: {
          select: {
            userNewsletterSubscriptions: true
          }
        }
      }
    });

    // Transform the data to match the expected format
    const transformedUsers = recentUsers.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
      newsletterCount: user._count.userNewsletterSubscriptions
    }));

    return NextResponse.json(transformedUsers);
  } catch (error) {
    console.error('Error fetching recent users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}