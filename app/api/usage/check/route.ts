import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { PrismaClient } from '@prisma/client';
import { SubscriptionService } from '@/lib/subscription'
import { FeatureFlag } from '@/lib/feature-flags'

const prisma = new PrismaClient();
// /app/api/usage/check/route.ts - Usage limit checking
export async function POST(request: NextRequest) {
  const session = await getServerSession()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { limitType } = await request.json()

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  const canProceed = await SubscriptionService.checkUsageLimit(user!.id, limitType)
  const hasFeatureAccess = await SubscriptionService.hasFeatureAccess(user!.id, limitType)

  return NextResponse.json({ 
    canProceed,
    hasFeatureAccess,
    requiresUpgrade: !canProceed && await FeatureFlag.isEnabled('monetization_enabled')
  })
}