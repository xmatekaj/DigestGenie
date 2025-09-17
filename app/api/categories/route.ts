// GET /api/categories - Public endpoint for landing page
export async function GET() {
  const categories = await prisma.categories.findMany({
    where: {
      user_id: null,
      is_active: true
    },
    orderBy: {
      sort_order: 'asc'
    }
  });
  
  return NextResponse.json(categories);
}