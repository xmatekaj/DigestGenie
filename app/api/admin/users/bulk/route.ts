// app/api/admin/users/bulk/route.ts - Bulk user actions
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

// PATCH /api/admin/users/bulk - Bulk user actions
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email || !(await isAdmin(session.user.email))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userIds, action } = await req.json();

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ error: 'No user IDs provided' }, { status: 400 });
    }

    // Get current admin user to prevent self-action
    const adminUser = await prisma.users.findUnique({
      where: { email: session.user.email }
    });

    // Filter out admin's own ID to prevent self-action
    const filteredUserIds = userIds.filter(id => id !== adminUser?.id);

    if (filteredUserIds.length === 0) {
      return NextResponse.json({ error: 'Cannot perform bulk actions on your own account' }, { status: 400 });
    }

    switch (action) {
      case 'activate':
        await prisma.users.updateMany({
          where: { 
            id: { in: filteredUserIds }
          },
          data: { is_active: true }
        });
        break;
        
      case 'deactivate':
      case 'ban':
        await prisma.users.updateMany({
          where: { 
            id: { in: filteredUserIds }
          },
          data: { is_active: false }
        });
        break;
        
      case 'delete':
        // Soft delete for bulk operations
        await prisma.users.updateMany({
          where: { 
            id: { in: filteredUserIds }
          },
          data: { 
            is_active: false,
            name: 'Deleted User'
          }
        });
        
        // Update emails to prevent conflicts
        for (const userId of filteredUserIds) {
          await prisma.users.update({
            where: { id: userId },
            data: { email: `deleted_${userId}@deleted.com` }
          });
        }
        break;
        
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      affected: filteredUserIds.length 
    });
  } catch (error) {
    console.error('Error performing bulk action:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}