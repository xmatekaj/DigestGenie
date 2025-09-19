// app/api/categories/route.ts - Public endpoint for landing page
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/categories - Public endpoint for landing page
export async function GET(req: NextRequest) {
  try {
    const categories = await prisma.categories.findMany({
      where: {
        user_id: null, // System categories only
        is_active: true // Only active categories
      },
      orderBy: {
        sort_order: 'asc'
      },
      select: {
        id: true,
        name: true,
        description: true,
        icon: true,
        color_gradient: true,
        // Include article count if you want to show it
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
      icon: category.icon || 'Globe',
      color: category.color_gradient || 'from-blue-500 to-cyan-500',
      articleCount: category._count?.articles || 0
    }));

    return NextResponse.json(transformedCategories);
  } catch (error) {
    console.error('Failed to fetch public categories:', error);
    
    // Return fallback categories if database fails
    const fallbackCategories = [
      { id: 'technology', name: 'Technology', icon: 'Zap', color: 'from-blue-500 to-cyan-500', articleCount: 0 },
      { id: 'programming', name: 'Programming', icon: 'Code', color: 'from-green-500 to-emerald-500', articleCount: 0 },
      { id: 'electronics', name: 'Electronics', icon: 'Cpu', color: 'from-purple-500 to-violet-500', articleCount: 0 },
      { id: 'business', name: 'Business', icon: 'Briefcase', color: 'from-orange-500 to-red-500', articleCount: 0 },
      { id: 'startup', name: 'Startup', icon: 'TrendingUp', color: 'from-pink-500 to-rose-500', articleCount: 0 },
      { id: 'global', name: 'Global News', icon: 'Globe', color: 'from-indigo-500 to-blue-500', articleCount: 0 }
    ];
    
    return NextResponse.json(fallbackCategories);
  }
}