// app/api/saved-articles/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Update saved article (notes, tags, etc.)
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

    // Verify ownership
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

    // Update saved article
    const updated = await prisma.savedArticle.update({
      where: { id: savedArticleId },
      data: {
        notes: body.notes !== undefined ? body.notes : savedArticle.notes,
        tags: body.tags !== undefined ? body.tags : savedArticle.tags,
        folderId: body.folderId !== undefined ? body.folderId : savedArticle.folderId,
      },
      include: {
        article: {
          include: {
            newsletter: {
              select: {
                name: true,
                logoUrl: true,
              },
            },
          },
        },
        folder: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Saved article updated',
      savedArticle: updated,
    });
  } catch (error) {
    console.error('Error updating saved article:', error);
    return NextResponse.json(
      { error: 'Failed to update saved article' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}