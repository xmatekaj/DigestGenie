// app/api/categories/route.ts - Updated for system user
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/categories - Public endpoint for landing page
export async function GET(req: NextRequest) {
  try {
    console.log('🔍 Fetching public categories...');
    
    // Query for system categories using the system user
    const systemCategories = await prisma.$queryRaw`
      SELECT id, user_id, name, description, icon, color, sort_order 
      FROM user_categories 
      WHERE user_id = 'system-user'
      ORDER BY sort_order ASC, created_at ASC
    `;
    
    console.log('System categories found:', systemCategories);

    if ((systemCategories as any[]).length === 0) {
      console.log('⚠️ No system categories found, returning fallback');
      // Return fallback categories
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

    // Transform data to match frontend expectations
    const transformedCategories = (systemCategories as any[]).map(category => ({
      id: category.id,
      name: category.name,
      description: category.description,
      icon: category.icon || 'Globe',
      color: category.color || 'from-blue-500 to-cyan-500',
      articleCount: 0
    }));

    console.log('✅ Returning transformed categories:', transformedCategories);
    return NextResponse.json(transformedCategories);
    
  } catch (error) {
    console.error('❌ Failed to fetch public categories:', error);
    
    // Return fallback categories on error
    const fallbackCategories = [
      { id: 'technology', name: 'Technology', icon: 'Zap', color: 'from-blue-500 to-cyan-500', articleCount: 0 },
      { id: 'programming', name: 'Programming', icon: 'Code', color: 'from-green-500 to-emerald-500', articleCount: 0 },
      { id: 'electronics', name: 'Electronics', icon: 'Cpu', color: 'from-purple-500 to-violet-500', articleCount: 0 }
    ];
    
    return NextResponse.json(fallbackCategories);
  }
}