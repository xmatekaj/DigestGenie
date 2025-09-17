// app/api/newsletters/route.ts - Newsletter CRUD operations
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const session = await getServerSession()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') // 'predefined' | 'user' | 'all'
  const subscribed = searchParams.get('subscribed') === 'true'

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let whereClause: any = { isActive: true }
    
    if (type === 'predefined') {
      whereClause.isPredefined = true
    } else if (type === 'user') {
      whereClause.createdBy = user.id
      whereClause.isPredefined = false
    }

    const newsletters = await prisma.newsletter.findMany({
      where: whereClause,
      include: {
        _count: {
          select: {
            userSubscriptions: subscribed ? {
              where: { userId: user.id, isActive: true }
            } : undefined
          }
        },
        userSubscriptions: subscribed ? {
          where: { userId: user.id, isActive: true },
          select: {
            id: true,
            customCategory: true,
            aiEnabled: true,
            displayPreference: true
          }
        } : false
      },
      orderBy: [
        { isPredefined: 'desc' },
        { name: 'asc' }
      ]
    })

    const formattedNewsletters = newsletters.map(newsletter => ({
      ...newsletter,
      isSubscribed: subscribed ? newsletter.userSubscriptions.length > 0 : undefined,
      subscription: subscribed && newsletter.userSubscriptions.length > 0 
        ? newsletter.userSubscriptions[0] 
        : null
    }))

    return NextResponse.json({ newsletters: formattedNewsletters })
  } catch (error) {
    console.error('Error fetching newsletters:', error)
    return NextResponse.json({ error: 'Failed to fetch newsletters' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const { name, description, senderEmail, senderDomain, websiteUrl, logoUrl, frequency } = body

    // Validate required fields
    if (!name || !senderEmail) {
      return NextResponse.json({ 
        error: 'Newsletter name and sender email are required' 
      }, { status: 400 })
    }

    // Check if user has reached their newsletter limit (based on subscription plan)
    const userSubscription = await prisma.userSubscription.findUnique({
      where: { userId: user.id },
      include: { plan: true }
    })

    const currentNewsletterCount = await prisma.userNewsletterSubscription.count({
      where: { 
        userId: user.id, 
        isActive: true,
        newsletter: { isPredefined: false }
      }
    })

    const maxNewsletters = userSubscription?.plan?.maxNewsletters || 3 // default free plan limit
    
    if (maxNewsletters !== -1 && currentNewsletterCount >= maxNewsletters) {
      return NextResponse.json({ 
        error: 'Newsletter limit reached. Upgrade your plan to add more newsletters.' 
      }, { status: 403 })
    }

    // Create newsletter
    const newsletter = await prisma.newsletter.create({
      data: {
        name,
        description,
        senderEmail,
        senderDomain,
        websiteUrl,
        logoUrl,
        frequency,
        isPredefined: false,
        createdBy: user.id
      }
    })

    return NextResponse.json({ newsletter }, { status: 201 })
  } catch (error) {
    console.error('Error creating newsletter:', error)
    return NextResponse.json({ error: 'Failed to create newsletter' }, { status: 500 })
  }
}