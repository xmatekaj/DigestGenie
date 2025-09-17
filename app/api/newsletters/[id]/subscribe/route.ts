// app/api/newsletters/[id]/subscribe/route.ts - Newsletter subscription management
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: {
    id: string
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
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

    const newsletterId = params.id
    const body = await request.json()
    const { 
      customCategory, 
      aiEnabled = true, 
      aiSummaryEnabled = true,
      aiCategorizationEnabled = true,
      aiInterestFiltering = false,
      displayPreference = { type: 'full', showImages: true }
    } = body

    // Check if newsletter exists
    const newsletter = await prisma.newsletter.findUnique({
      where: { id: newsletterId, isActive: true }
    })

    if (!newsletter) {
      return NextResponse.json({ error: 'Newsletter not found' }, { status: 404 })
    }

    // Check subscription limits for free users
    const userSubscription = await prisma.userSubscription.findUnique({
      where: { userId: user.id },
      include: { plan: true }
    })

    const currentSubscriptionCount = await prisma.userNewsletterSubscription.count({
      where: { userId: user.id, isActive: true }
    })

    const maxNewsletters = userSubscription?.plan?.maxNewsletters || 3
    
    if (maxNewsletters !== -1 && currentSubscriptionCount >= maxNewsletters) {
      return NextResponse.json({ 
        error: 'Subscription limit reached. Upgrade your plan to subscribe to more newsletters.' 
      }, { status: 403 })
    }

    // Create or update subscription
    const subscription = await prisma.userNewsletterSubscription.upsert({
      where: {
        userId_newsletterId: {
          userId: user.id,
          newsletterId
        }
      },
      create: {
        userId: user.id,
        newsletterId,
        customCategory,
        aiEnabled,
        aiSummaryEnabled,
        aiCategorizationEnabled,
        aiInterestFiltering,
        displayPreference,
        isActive: true
      },
      update: {
        customCategory,
        aiEnabled,
        aiSummaryEnabled,
        aiCategorizationEnabled,
        aiInterestFiltering,
        displayPreference,
        isActive: true,
        updatedAt: new Date()
      },
      include: {
        newsletter: true
      }
    })

    // Generate system email if user doesn't have one
    if (!user.systemEmail) {
      const systemEmail = `user${user.id.slice(0, 8)}@newsletters.yourdomain.com`
      await prisma.user.update({
        where: { id: user.id },
        data: { systemEmail }
      })

      // Create email processing record
      await prisma.emailProcessing.create({
        data: {
          userId: user.id,
          emailAddress: systemEmail,
          processingStatus: 'active'
        }
      })
    }

    return NextResponse.json({ subscription }, { status: 201 })
  } catch (error) {
    console.error('Error subscribing to newsletter:', error)
    return NextResponse.json({ error: 'Failed to subscribe to newsletter' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

    const newsletterId = params.id

    // Deactivate subscription instead of deleting (to preserve history)
    const subscription = await prisma.userNewsletterSubscription.updateMany({
      where: {
        userId: user.id,
        newsletterId,
        isActive: true
      },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    })

    if (subscription.count === 0) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Unsubscribed successfully' })
  } catch (error) {
    console.error('Error unsubscribing from newsletter:', error)
    return NextResponse.json({ error: 'Failed to unsubscribe from newsletter' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
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

    const newsletterId = params.id
    const body = await request.json()
    
    const subscription = await prisma.userNewsletterSubscription.update({
      where: {
        userId_newsletterId: {
          userId: user.id,
          newsletterId
        }
      },
      data: {
        ...body,
        updatedAt: new Date()
      },
      include: {
        newsletter: true
      }
    })

    return NextResponse.json({ subscription })
  } catch (error) {
    console.error('Error updating subscription:', error)
    return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 })
  }
}