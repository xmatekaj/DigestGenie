// File: app/api/admin/categories/route.ts
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

// GET /api/admin/categories - Fetch all categories for admin panel
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!(await isAdmin(session.user.email))) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    console.log('🔍 Fetching categories for admin panel...');

    // First, try to fetch from the new categories table
    let categories;
    try {
      categories = await prisma.userCategory.findMany({
        where: {
          userId: null // System categories
        },
        orderBy: [
          { sortOrder: 'asc' },
          { createdAt: 'asc' }
        ]
      });
      console.log(`Found ${categories.length} categories in categories table`);
    } catch (error) {
      console.log('Categories table not available, trying user_categories...');
      categories = [];
    }

    // If no categories found in the new table, try the old user_categories table
    if (categories.length === 0) {
      try {
        const userCategories = await prisma.$queryRaw`
          SELECT id, name, description, color, icon, sort_order, created_at
          FROM user_categories 
          WHERE user_id = 'system-user'
          ORDER BY sort_order ASC, created_at ASC
        `;
        console.log(`Found ${(userCategories as any[]).length} categories in user_categories table`);
        
        // Transform user_categories format to match expected format
        categories = (userCategories as any[]).map(cat => ({
          id: cat.id,
          name: cat.name,
          description: cat.description || '',
          icon: cat.icon || 'Globe',
          color: cat.color || '#3B82F6',
          sortOrder: cat.sortOrder || 1,
          userId: null,
          createdAt: cat.created_at
        }));
      } catch (error) {
        console.error('Error fetching from user_categories:', error);
        categories = [];
      }
    }

    // Transform to match frontend expectations
    const transformedCategories = categories.map(category => ({
      id: category.id,
      name: category.name,
      description: category.description || '',
      slug: category.name.toLowerCase().replace(/\s+/g, '-'),
      icon: category.icon || 'Globe',
      color: category.colorGradient || '#3B82F6',
      sortOrder: category.sortOrder || 1,
      articleCount: 0 // TODO: Calculate actual article count
    }));

    console.log(`✅ Returning ${transformedCategories.length} transformed categories`);
    return NextResponse.json(transformedCategories);

  } catch (error) {
    console.error('❌ Failed to fetch admin categories:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/categories - Create new category
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
    const { name, description, icon, colorGradient, isActive } = body;

    // Validation
    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    // Check for duplicate category names
    let duplicateExists = false;
    try {
      const existingCategory = await prisma.userCategory.findFirst({
        where: {
          name: name.trim(),
          userId: null
        }
      });
      duplicateExists = !!existingCategory;
    } catch (error) {
      // If categories table doesn't exist, check user_categories
      try {
        const userCategories = await prisma.$queryRaw`
          SELECT id FROM user_categories 
          WHERE user_id = 'system-user' AND name = ${name.trim()}
          LIMIT 1
        `;
        duplicateExists = (userCategories as any[]).length > 0;
      } catch (e) {
        console.error('Error checking duplicates:', e);
      }
    }

    if (duplicateExists) {
      return NextResponse.json({ error: 'Category with this name already exists' }, { status: 409 });
    }

    // Try to create in categories table first
    let newCategory;
    try {
      newCategory = await prisma.userCategory.create({
        data: {
          name: name.trim(),
          description: description?.trim() || '',
          icon: icon || 'Globe',
          color: colorGradient || '#3B82F6',
          sortOrder: 1,
          userId: null
        }
      });
    } catch (error) {
      // If categories table doesn't exist, create in user_categories
      console.log('Categories table not available, creating in user_categories...');
      try {
        const result = await prisma.$queryRaw`
          INSERT INTO user_categories (name, description, color, icon, sort_order, user_id, created_at)
          VALUES (${name.trim()}, ${description?.trim() || ''}, ${colorGradient || '#3B82F6'}, ${icon || 'Globe'}, 1, 'system-user', NOW())
          RETURNING *
        `;
        
        const insertedCategory = (result as any[])[0];
        newCategory = {
          id: insertedCategory.id,
          name: insertedCategory.name,
          description: insertedCategory.description,
          icon: insertedCategory.icon,
          color: insertedCategory.color,
          sortOrder: insertedCategory.sortOrder,
          userId: null,
          createdAt: insertedCategory.created_at
        };
      } catch (fallbackError) {
        console.error('Failed to create category in user_categories:', fallbackError);
        return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
      }
    }

    // Transform response
    const transformedCategory = {
      id: newCategory.id,
      name: newCategory.name,
      description: newCategory.description || '',
      slug: newCategory.name.toLowerCase().replace(/\s+/g, '-'),
      icon: newCategory.icon || 'Globe',
      color: newCategory.colorGradient || '#3B82F6',
      sortOrder: newCategory.sortOrder || 1,
      articleCount: 0
    };

    return NextResponse.json(transformedCategory, { status: 201 });

  } catch (error) {
    console.error('Failed to create category:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}