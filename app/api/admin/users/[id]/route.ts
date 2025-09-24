// app/api/admin/users/[id]/route.ts - Individual user actions
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

// PATCH /api/admin/users/[id] - Update user status
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email || !(await isAdmin(session.user.email))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = params.id;
    const { action } = await req.json();

    // Check if user exists
    const user = await prisma.users.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prevent admin from disabling themselves
    if (user.email === session.user.email && (action === 'deactivate' || action === 'ban' || action === 'delete')) {
      return NextResponse.json({ error: 'Cannot perform this action on your own account' }, { status: 400 });
    }

    switch (action) {
      case 'activate':
        await prisma.users.update({
          where: { id: userId },
          data: { is_active: true }
        });
        break;
        
      case 'deactivate':
      case 'ban':
        await prisma.users.update({
          where: { id: userId },
          data: { is_active: false }
        });
        break;
        
      case 'delete':
        // Soft delete - you might want to implement hard delete or data cleanup
        await prisma.users.update({
          where: { id: userId },
          data: { 
            is_active: false,
            email: `deleted_${userId}@deleted.com`,
            name: 'Deleted User'
          }
        });
        break;
        
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/admin/users/[id] - Delete user permanently
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email || !(await isAdmin(session.user.email))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = params.id;

    // Check if user exists
    const user = await prisma.users.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prevent admin from deleting themselves
    if (user.email === session.user.email) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
    }

    // Delete user and related data
    await prisma.$transaction([
      // Delete user newsletters
      prisma.userNewsletters.deleteMany({
        where: { user_id: userId }
      }),
      // Delete user categories
      prisma.categories.deleteMany({
        where: { user_id: userId }
      }),
      // Delete user
      prisma.users.delete({
        where: { id: userId }
      })
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}