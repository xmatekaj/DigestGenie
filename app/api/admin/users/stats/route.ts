// app/api/admin/users/stats/route.ts - User statistics API
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

    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      activeUsers,
      bannedUsers,
      newUsersThisWeek,
      proUsers
    ] = await Promise.all([
      // Total users
      prisma.user.count(),
      
      // Active users (logged in within last 30 days)
      prisma.user.count({
        where: {
          isVerified: true,
          updatedAt: {
            gte: lastMonth
          }
        }
      }),
      
      // Banned users (inactive users)
      prisma.user.count({
        where: {
          isVerified: false
        }
      }),
      
      // New users this week
      prisma.user.count({
        where: {
          createdAt: {
            gte: lastWeek
          }
        }
      }),
      
      // Pro users (placeholder - implement when you add subscription system)
      0 // TODO: Count pro users when subscription system is implemented
    ]);

    const stats = {
      totalUsers,
      activeUsers,
      bannedUsers,
      proUsers,
      newUsersThisWeek
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}