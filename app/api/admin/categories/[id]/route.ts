// app/api/admin/categories/[id]/route.ts - Fixed to use correct categories table
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Check if user is admin
async function isAdmin(email: string): Promise<boolean> {
  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || [
    'admin@digestgenie.com',
    'matekaj@proton.me'
  ];
  return adminEmails.includes(email);
}

// PUT /api/admin/categories/[id] - Update category
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!(await isAdmin(session.user.email))) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const categoryId = params.id;
    const body = await req.json();
    const { name, description, icon, colorGradient, isActive } = body;

    // Validation
    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    // Check if category exists
    const existingCategory = await prisma.categories.findUnique({
      where: { id: categoryId }
    });

    if (!existingCategory) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Check if this is a system category (user_id should be null)
    if (existingCategory.user_id !== null) {
      return NextResponse.json({ error: 'Cannot edit user-specific categories via admin panel' }, { status: 403 });
    }

    // Check if another category with the same name exists (excluding current one)
    const duplicateCategory = await prisma.categories.findFirst({
      where: {
        name: name.trim(),
        user_id: null,
        NOT: {
          id: categoryId
        }
      }
    });

    if (duplicateCategory) {
      return NextResponse.json({ error: 'Category with this name already exists' }, { status: 409 });
    }

    // Update category
    const updatedCategory = await prisma.categories.update({
      where: { id: categoryId },
      data: {
        name: name.trim(),
        description: description?.trim() || '',
        icon: icon || 'Globe',
        color_gradient: colorGradient || 'from-blue-500 to-cyan-500',
        is_active: isActive !== false
      }
    });

    const transformedCategory = {
      id: updatedCategory.id,
      name: updatedCategory.name,
      description: updatedCategory.description || '',
      slug: updatedCategory.name.toLowerCase().replace(/\s+/g, '-'),
      icon: updatedCategory.icon || 'Globe',
      colorGradient: updatedCategory.color_gradient || 'from-blue-500 to-cyan-500',
      isActive: updatedCategory.is_active ?? true,
      sortOrder: updatedCategory.sort_order || 1,
      articleCount: 0
    };

    return NextResponse.json(transformedCategory);
  } catch (error) {
    console.error('Failed to update category:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/admin/categories/[id] - Delete category
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!(await isAdmin(session.user.email))) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const categoryId = params.id;

    // Check if category exists
    const existingCategory = await prisma.categories.findUnique({
      where: { id: categoryId }
    });

    if (!existingCategory) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Check if this is a system category
    if (existingCategory.user_id !== null) {
      return NextResponse.json({ error: 'Cannot delete user-specific categories via admin panel' }, { status: 403 });
    }

    // TODO: Check if category has articles - prevent deletion if it does
    // This will be implemented when you have articles table connected
    // const articleCount = await prisma.articles.count({
    //   where: { ai_category_id: categoryId }
    // });
    
    // if (articleCount > 0) {
    //   return NextResponse.json({ 
    //     error: `Cannot delete category with ${articleCount} articles. Please reassign articles first.` 
    //   }, { status: 409 });
    // }

    // Delete category
    await prisma.categories.delete({
      where: { id: categoryId }
    });

    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Failed to delete category:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}