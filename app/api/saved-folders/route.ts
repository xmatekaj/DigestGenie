// app/api/saved-folders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all folders
export async function GET(request: NextRequest) {
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

    // Get folders with article counts
    const folders = await prisma.savedFolder.findMany({
      where: {
        userId: user.id,
      },
      include: {
        _count: {
          select: {
            articles: true,
          },
        },
      },
      orderBy: {
        sortOrder: 'asc',
      },
    });

    // Format response
    const formattedFolders = folders.map(folder => ({
      id: folder.id,
      name: folder.name,
      description: folder.description,
      color: folder.color,
      icon: folder.icon,
      sortOrder: folder.sortOrder,
      articleCount: folder._count.articles,
      createdAt: folder.createdAt.toISOString(),
    }));

    return NextResponse.json(formattedFolders);
  } catch (error) {
    console.error('Error fetching folders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch folders' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Create a new folder
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { name, description, color, icon } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Folder name is required' },
        { status: 400 }
      );
    }

    // Check if folder with same name exists
    const existingFolder = await prisma.savedFolder.findFirst({
      where: {
        userId: user.id,
        name: name,
      },
    });

    if (existingFolder) {
      return NextResponse.json(
        { error: 'A folder with this name already exists' },
        { status: 409 }
      );
    }

    // Get the highest sort order
    const lastFolder = await prisma.savedFolder.findFirst({
      where: { userId: user.id },
      orderBy: { sortOrder: 'desc' },
    });

    const sortOrder = lastFolder ? lastFolder.sortOrder + 1 : 0;

    // Create folder
    const folder = await prisma.savedFolder.create({
      data: {
        userId: user.id,
        name,
        description: description || null,
        color: color || '#3B82F6',
        icon: icon || 'folder',
        sortOrder,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Folder created',
        folder,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating folder:', error);
    return NextResponse.json(
      { error: 'Failed to create folder' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}