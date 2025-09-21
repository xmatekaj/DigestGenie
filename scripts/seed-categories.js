// scripts/seed-categories.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const defaultCategories = [
  {
    name: 'Technology',
    description: 'Latest tech news and innovations',
    icon: 'Zap',
    color_gradient: 'from-blue-500 to-cyan-500',
    sort_order: 1
  },
  {
    name: 'Programming',
    description: 'Development, coding, and software engineering',
    icon: 'Code',
    color_gradient: 'from-green-500 to-emerald-500',
    sort_order: 2
  },
  {
    name: 'Electronics',
    description: 'Hardware, circuits, and electronic engineering',
    icon: 'Cpu',
    color_gradient: 'from-purple-500 to-violet-500',
    sort_order: 3
  },
  {
    name: 'Business',
    description: 'Corporate news and business insights',
    icon: 'Briefcase',
    color_gradient: 'from-orange-500 to-red-500',
    sort_order: 4
  },
  {
    name: 'Startup',
    description: 'Entrepreneurship and venture capital',
    icon: 'TrendingUp',
    color_gradient: 'from-pink-500 to-rose-500',
    sort_order: 5
  },
  {
    name: 'Global News',
    description: 'International news and current events',
    icon: 'Globe',
    color_gradient: 'from-indigo-500 to-blue-500',
    sort_order: 6
  }
];

async function seedCategories() {
  try {
    console.log('🌱 Seeding default categories...');
    
    // Check if categories already exist
    const existingCategories = await prisma.categories.count({
      where: { user_id: null }
    });

    if (existingCategories > 0) {
      console.log(`ℹ️  Found ${existingCategories} existing categories. Skipping seed.`);
      console.log('💡 To force reseed, delete existing categories first.');
      return;
    }

    // Create categories
    for (const category of defaultCategories) {
      const created = await prisma.categories.create({
        data: {
          name: category.name,
          description: category.description,
          icon: category.icon,
          color_gradient: category.color_gradient,
          sort_order: category.sort_order,
          is_active: true,
          user_id: null // System category
        }
      });
      console.log(`✅ Created category: ${created.name}`);
    }
    
    console.log('🎉 Categories seeded successfully!');
    
    // Show final count
    const totalCategories = await prisma.categories.count({
      where: { user_id: null }
    });
    console.log(`📊 Total system categories: ${totalCategories}`);
    
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding function
seedCategories();