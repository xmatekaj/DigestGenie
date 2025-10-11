// app/api/dashboard/stats/route.ts
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

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get stats in parallel for better performance
    const [
      totalNewsletters,
      unreadArticles,
      savedArticles,
      readToday
    ] = await Promise.all([
      // Count user's subscribed newsletters
      prisma.userNewsletter.count({
        where: { 
          userId: user.id,
          isActive: true
        }
      }),

      // Count unread articles (assuming you have a UserArticle table to track read status)
      // If not, this will return 0 for now
      prisma.article.count({
        where: {
          newsletter: {
            userNewsletters: {
              some: {
                userId: user.id,
                isActive: true
              }
            }
          },
          // Assuming you'll add a read tracking mechanism
          NOT: {
            readByUsers: {
              some: { userId: user.id }
            }
          }
        }
      }).catch(() => 0), // Return 0 if table doesn't exist yet

      // Count saved articles
      prisma.savedArticle.count({
        where: { userId: user.id }
      }).catch(() => 0),

      // Count articles read today
      prisma.articleRead.count({
        where: {
          userId: user.id,
          readAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }).catch(() => 0)
    ]);

    return NextResponse.json({
      totalNewsletters,
      unreadArticles,
      savedArticles,
      readToday
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}