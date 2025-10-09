// app/api/saved-articles/[id]/move/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const savedArticleId = params.id;
    const body = await request.json();
    const { folderId } = body;

    // Verify ownership of saved article
    const savedArticle = await prisma.savedArticle.findFirst({
      where: {
        id: savedArticleId,
        userId: user.id,
      },
    });

    if (!savedArticle) {
      return NextResponse.json(
        { error: 'Saved article not found' },
        { status: 404 }
      );
    }

    // If folderId provided, verify folder ownership
    if (folderId) {
      const folder = await prisma.savedFolder.findFirst({
        where: {
          id: folderId,
          userId: user.id,
        },
      });

      if (!folder) {
        return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
      }
    }

    // Update saved article folder
    await prisma.savedArticle.update({
      where: { id: savedArticleId },
      data: {
        folderId: folderId || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: folderId ? 'Article moved to folder' : 'Article removed from folder',
    });
  } catch (error) {
    console.error('Error moving article:', error);
    return NextResponse.json(
      { error: 'Failed to move article' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}