// app/api/admin/users/route.ts - Users management API (Fixed async issue)
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

// GET /api/admin/users - Fetch all users
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email || !(await isAdmin(session.user.email))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch users with their newsletter counts and last activity
    const users = await prisma.user.findMany({
      include: {
        _count: {
          select: {
            userNewsletterSubscriptions: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Get admin emails list for role checking
    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || [
      'admin@digestgenie.com',
      'matekaj@proton.me'
    ];

    // Transform data for frontend
    const transformedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      status: user.isVerified ? 'active' : 'inactive',
      role: adminEmails.includes(user.email) ? 'admin' : 'user',
      newsletterCount: user._count.userNewsletterSubscriptions,
      lastLogin: user.updatedAt?.toISOString() || null,
      createdAt: user.createdAt.toISOString(),
      plan: 'free' // TODO: Add plan field to database
    }));

    return NextResponse.json(transformedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}