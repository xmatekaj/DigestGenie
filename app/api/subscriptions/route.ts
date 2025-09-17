// /app/api/subscriptions/route.ts - Newsletter subscriptions
export async function GET(request: NextRequest) {
  const session = await getServerSession()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      subscriptions: {
        include: {
          newsletter: true
        }
      }
    }
  })

  return NextResponse.json({ subscriptions: user?.subscriptions || [] })
}

export async function POST(request: NextRequest) {
  const session = await getServerSession()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { newsletterId, customCategory, displayPreference } = await request.json()

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  const subscription = await prisma.userSubscription.create({
    data: {
      userId: user!.id,
      newsletterId,
      customCategory,
      displayPreference,
    }
  })

  return NextResponse.json({ subscription })
}