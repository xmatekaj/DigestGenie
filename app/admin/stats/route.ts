// app/api/admin/stats/route.ts - Admin statistics endpoint
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

    // Calculate date ranges
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Fetch statistics in parallel
    const [
      totalUsers,
      activeUsers,
      totalNewsletters,
      activeNewsletters,
      totalSubscriptions,
      totalCategories,
      recentSignups,
      processedEmails
    ] = await Promise.all([
      // Total users
      prisma.users.count(),
      
      // Active users (logged in within last 30 days)
      prisma.users.count({
        where: {
          updated_at: {
            gte: lastMonth
          }
        }
      }),
      
      // Total newsletters
      prisma.newsletters.count(),
      
      // Active newsletters (processed within last 30 days)
      prisma.newsletters.count({
        where: {
          updated_at: {
            gte: lastMonth
          }
        }
      }),
      
      // Total subscriptions
      prisma.userNewsletters.count(),
      
      // Total categories
      prisma.categories.count({
        where: {
          user_id: null // Only predefined categories
        }
      }),
      
      // Recent signups (last 7 days)
      prisma.users.count({
        where: {
          created_at: {
            gte: lastWeek
          }
        }
      }),
      
      // Processed emails this month (if you have an emails table)
      // For now, we'll use newsletter subscriptions as a proxy
      prisma.userNewsletters.count({
        where: {
          created_at: {
            gte: lastMonth
          }
        }
      })
    ]);

    const stats = {
      totalUsers,
      activeUsers,
      totalNewsletters,
      activeNewsletters,
      totalSubscriptions,
      totalCategories,
      recentSignups,
      processedEmails
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}