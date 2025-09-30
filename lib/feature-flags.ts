// /lib/feature-flags.ts - Feature flag management
export class FeatureFlag {
  private static cache = new Map<string, { value: boolean, expiry: number }>()
  private static CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  static async isEnabled(flagName: string, userId?: string): Promise<boolean> {
    // Check cache first
    const cached = this.cache.get(flagName)
    if (cached && Date.now() < cached.expiry) {
      return cached.value
    }
    // TODO
    // const flag = await prisma.featureFlag.findUnique({
    //   where: { name: flagName }
    // })
    // if (!flag) {
    //   this.cache.set(flagName, { value: false, expiry: Date.now() + this.CACHE_TTL })
    //   return false
    // }

    // let isEnabled = flag.isEnabled

    // // Check rollout percentage
    // if (isEnabled && flag.rolloutPercentage < 100) {
    //   if (userId) {
    //     // Deterministic rollout based on user ID
    //     const hash = this.hashUserId(userId)
    //     isEnabled = hash % 100 < flag.rolloutPercentage
    //   } else {
    //     // Random rollout
    //     isEnabled = Math.random() * 100 < flag.rolloutPercentage
    //   }
    // }

    // // Check targeted users
    // if (isEnabled && flag.targetUsers && flag.targetUsers.length > 0 && userId) {
    //   isEnabled = flag.targetUsers.includes(userId)
    // }

    // this.cache.set(flagName, { value: isEnabled, expiry: Date.now() + this.CACHE_TTL })
    return false //isEnabled
  }

  static async setFlag(flagName: string, enabled: boolean, rolloutPercentage = 100) {
    // TODO
    // await prisma.featureFlag.upsert({
    //   where: { name: flagName },
    //   create: {
    //     name: flagName,
    //     isEnabled: enabled,
    //     rolloutPercentage
    //   },
    //   update: {
    //     isEnabled: enabled,
    //     rolloutPercentage,
    //     updatedAt: new Date()
    //   }
    // })

    // Clear cache
    this.cache.delete(flagName)
  }

  private static hashUserId(userId: string): number {
    let hash = 0
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }
}