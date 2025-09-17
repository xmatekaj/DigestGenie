// /app/api/subscription/route.ts - Subscription API (hidden)
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { SubscriptionService } from '@/lib/subscription'
import { FeatureFlag } from '@/lib/feature-flags'

export async function GET(request: NextRequest) {
  const session = await getServerSession()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Only return subscription info if monetization is enabled
  if (!(await FeatureFlag.isEnabled('monetization_enabled'))) {
    return NextResponse.json({ 
      plan: { name: 'free', displayName: 'Free' },
      hasUnlimitedAccess: true 
    })
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  const subscription = await SubscriptionService.getUserSubscription(user!.id)
  
  return NextResponse.json({ subscription })
}