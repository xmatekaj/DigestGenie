// app/api/admin/categories/route.ts - Updated for system user
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Check if user is admin
async function isAdmin(email: string): Promise<boolean> {
  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
  return adminEmails.includes(email);
}

// GET /api/admin/categories - Fetch all system categories
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!(await isAdmin(session.user.email))) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    // Query user_categories table for system categories
    const categories = await prisma.$queryRaw`
      SELECT * FROM user_categories 
      WHERE user_id = 'system-user'
      ORDER BY sort_order ASC, created_at ASC
    `;

    // Transform data to match frontend expectations
    const transformedCategories = (categories as any[]).map(category => ({
      id: category.id,
      name: category.name,
      description: category.description || '',
      slug: category.name.toLowerCase().replace(/\s+/g, '-'),
      icon: category.icon || 'Globe',
      colorGradient: category.color || 'from-blue-500 to-cyan-500',
      isActive: true, // No is_active column in existing table
      sortOrder: category.sort_order || 1,
      articleCount: 0 // TODO: Count actual articles
    }));

    return NextResponse.json(transformedCategories);
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/categories - Create new system category
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
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
    const existingCategories = await prisma.$queryRaw`
      SELECT * FROM user_categories 
      WHERE name = ${name.trim()} AND user_id = 'system-user'
    `;

    if ((existingCategories as any[]).length > 0) {
      return NextResponse.json({ error: 'Category with this name already exists' }, { status: 409 });
    }

    // Get next sort order
    const lastCategories = await prisma.$queryRaw`
      SELECT sort_order FROM user_categories 
      WHERE user_id = 'system-user'
      ORDER BY sort_order DESC LIMIT 1
    `;
    const nextSortOrder = (lastCategories as any[])[0]?.sort_order ? (lastCategories as any[])[0].sort_order + 1 : 1;

    // Create new category
    const categoryId = generateId();
    await prisma.$queryRaw`
      INSERT INTO user_categories (id, user_id, name, description, color, icon, sort_order, created_at)
      VALUES (${categoryId}, 'system-user', ${name.trim()}, ${description?.trim() || ''}, ${colorGradient || 'from-blue-500 to-cyan-500'}, ${icon || 'Globe'}, ${nextSortOrder}, NOW())
    `;

    // Fetch the created category
    const newCategory = await prisma.$queryRaw`
      SELECT * FROM user_categories WHERE id = ${categoryId}
    `;

    const category = (newCategory as any[])[0];
    const transformedCategory = {
      id: category.id,
      name: category.name,
      description: category.description || '',
      slug: category.name.toLowerCase().replace(/\s+/g, '-'),
      icon: category.icon || 'Globe',
      colorGradient: category.color || 'from-blue-500 to-cyan-500',
      isActive: true,
      sortOrder: category.sort_order || 1,
      articleCount: 0
    };

    return NextResponse.json(transformedCategory, { status: 201 });
  } catch (error) {
    console.error('Failed to create category:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to generate ID (similar to cuid)
function generateId() {
  return 'clr' + Math.random().toString(36).substring(2) + Date.now().toString(36);
}