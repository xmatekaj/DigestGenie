// /lib/subscription.ts - Subscription management service
import { prisma } from '@/lib/prisma'
import { FeatureFlag } from './feature-flags'

export class SubscriptionService {
  static async getUserSubscription(userId: string) {
    return await prisma.userSubscription.findUnique({
      where: { userId },
      include: {
        plan: true
      }
    })
  }

  static async createFreeSubscription(userId: string) {
    const freePlan = await prisma.subscriptionPlan.findFirst({
      where: { name: 'free' }
    })

    if (!freePlan) throw new Error('Free plan not found')

    return await prisma.userSubscription.create({
      data: {
        userId,
        planId: freePlan.id,
        status: 'active',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      }
    })
  }

  static async hasFeatureAccess(userId: string, feature: string): Promise<boolean> {
    // If monetization is disabled, grant all features
    if (!(await FeatureFlag.isEnabled('monetization_enabled'))) {
      return true
    }

    const result = await prisma.$queryRaw<[{user_has_feature_access: boolean}]>`
      SELECT user_has_feature_access(${userId}::uuid, ${feature}::varchar(100))
    `
    
    return result[0]?.user_has_feature_access || false
  }

  static async checkUsageLimit(userId: string, limitType: string): Promise<boolean> {
    // If usage limits are disabled, allow unlimited
    if (!(await FeatureFlag.isEnabled('usage_limits_enforced'))) {
      return true
    }

    const result = await prisma.$queryRaw<[{check_usage_limit: boolean}]>`
      SELECT check_usage_limit(${userId}::uuid, ${limitType}::varchar(50))
    `
    
    return result[0]?.check_usage_limit || false
  }

  static async trackUsage(userId: string, eventType: string, eventData?: any) {
    // Only track if monetization is enabled
    if (!(await FeatureFlag.isEnabled('monetization_enabled'))) {
      return
    }

    await prisma.usageEvent.create({
      data: {
        userId,
        eventType,
        eventData: eventData || {},
        quotaConsumed: 1
      }
    })

    // Update subscription usage counters
    await this.updateUsageCounters(userId, eventType)
  }

  private static async updateUsageCounters(userId: string, eventType: string) {
    const updates: any = {}
    
    switch (eventType) {
      case 'newsletter_added':
        updates.newslettersCount = { increment: 1 }
        break
      case 'article_processed':
        updates.articlesThisMonth = { increment: 1 }
        break
      case 'article_saved':
        updates.savedArticlesCount = { increment: 1 }
        break
      case 'category_created':
        updates.categoriesCount = { increment: 1 }
        break
    }

    if (Object.keys(updates).length > 0) {
      await prisma.userSubscription.updateMany({
        where: { userId, status: 'active' },
        data: updates
      })
    }
  }

  // Future: Upgrade to paid plan (hidden for now)
  static async upgradeToPlan(userId: string, planName: string, billingCycle: 'monthly' | 'yearly') {
    if (!(await FeatureFlag.isEnabled('monetization_enabled'))) {
      throw new Error('Subscriptions not available')
    }

    const plan = await prisma.subscriptionPlan.findFirst({
      where: { name: planName, isActive: true }
    })

    if (!plan) throw new Error('Plan not found')

    // This would integrate with Stripe in the future
    const subscription = await prisma.userSubscription.upsert({
      where: { userId },
      create: {
        userId,
        planId: plan.id,
        billingCycle,
        status: 'active',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(
          Date.now() + (billingCycle === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000
        )
      },
      update: {
        planId: plan.id,
        billingCycle,
        status: 'active',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(
          Date.now() + (billingCycle === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000
        )
      }
    })

    await this.trackUsage(userId, 'plan_upgraded', { planName, billingCycle })
    return subscription
  }
}