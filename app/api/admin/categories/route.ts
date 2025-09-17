// app/api/admin/categories/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Check if user is admin
async function isAdmin(email: string): Promise<boolean> {
  const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
  return adminEmails.includes(email);
}

// GET /api/admin/categories - Fetch all categories
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!(await isAdmin(session.user.email))) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const categories = await prisma.categories.findMany({
      where: {
        user_id: null // System categories only
      },
      orderBy: {
        created_at: 'asc'
      },
      include: {
        _count: {
          select: {
            articles: true
          }
        }
      }
    });

    // Transform data to match frontend expectations
    const transformedCategories = categories.map(category => ({
      id: category.id,
      name: category.name,
      description: category.description,
      slug: category.name.toLowerCase().replace(/\s+/g, '-'),
      icon: category.icon || 'Globe',
      colorGradient: category.color || 'from-blue-500 to-cyan-500',
      isActive: true, // Add this field to your schema if needed
      sortOrder: 1,
      articleCount: category._count.articles
    }));

    return NextResponse.json(transformedCategories);
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/categories - Create new category
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!(await isAdmin(session.user.email))) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { name, description, icon, colorGradient } = body;

    // Validation
    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    // Check if category already exists
    const existingCategory = await prisma.categories.findFirst({
      where: {
        name: name.trim(),
        user_id: null
      }
    });

    if (existingCategory) {
      return NextResponse.json({ error: 'Category with this name already exists' }, { status: 409 });
    }

    // Create new category
    const newCategory = await prisma.categories.create({
      data: {
        name: name.trim(),
        description: description?.trim() || '',
        icon: icon || 'Globe',
        color: colorGradient || 'from-blue-500 to-cyan-500',
        user_id: null // System category
      },
      include: {
        _count: {
          select: {
            articles: true
          }
        }
      }
    });

    const transformedCategory = {
      id: newCategory.id,
      name: newCategory.name,
      description: newCategory.description,
      slug: newCategory.name.toLowerCase().replace(/\s+/g, '-'),
      icon: newCategory.icon || 'Globe',
      colorGradient: newCategory.color || 'from-blue-500 to-cyan-500',
      isActive: true,
      sortOrder: 1,
      articleCount: newCategory._count.articles
    };

    return NextResponse.json(transformedCategory, { status: 201 });
  } catch (error) {
    console.error('Failed to create category:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}