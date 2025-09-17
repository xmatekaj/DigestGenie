// /app/admin/layout.tsx - Admin layout with protection
import { NextAuthProvider } from '@/providers/auth'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth/next'

async function isAdmin(email: string): Promise<boolean> {
  // Add your admin email addresses here
  const adminEmails = [
    'admin@yourdomain.com',
    'your-email@gmail.com'
    // Add more admin emails as needed
  ]
  return adminEmails.includes(email)
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession()
  
  if (!session?.user?.email) {
    redirect('/auth/signin')
  }

  if (!(await isAdmin(session.user.email))) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Admin Panel</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{session.user.email}</span>
              <a 
                href="/dashboard" 
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Back to App
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  )
}

// /app/admin/page.tsx - Admin dashboard
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { BarChart3, Users, CreditCard, Flag, Settings, Database } from 'lucide-react'

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
        <p className="text-gray-600">Manage your newsletter aggregation platform</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">
              Total registered users
            </p>
            <Link href="/admin/users">
              <Button variant="outline" size="sm" className="mt-2">
                Manage Users
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Feature Flags</CardTitle>
            <Flag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              Active feature flags
            </p>
            <Link href="/admin/feature-flags">
              <Button variant="outline" size="sm" className="mt-2">
                Manage Flags
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monetization</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Disabled</div>
            <p className="text-xs text-muted-foreground">
              Revenue system status
            </p>
            <Link href="/admin/monetization">
              <Button variant="outline" size="sm" className="mt-2">
                Configure
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Analytics</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24.5K</div>
            <p className="text-xs text-muted-foreground">
              Articles processed this month
            </p>
            <Link href="/admin/analytics">
              <Button variant="outline" size="sm" className="mt-2">
                View Analytics
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Healthy</div>
            <p className="text-xs text-muted-foreground">
              All services operational
            </p>
            <Link href="/admin/system">
              <Button variant="outline" size="sm" className="mt-2">
                System Status
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Settings</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Configure</div>
            <p className="text-xs text-muted-foreground">
              Platform configuration
            </p>
            <Link href="/admin/settings">
              <Button variant="outline" size="sm" className="mt-2">
                Manage Settings
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// /app/admin/feature-flags/page.tsx - Feature flag management
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'

interface FeatureFlag {
  id: string
  name: string
  description: string
  isEnabled: boolean
  rolloutPercentage: number
  targetUsers: string[]
  createdAt: string
}

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    fetchFlags()
  }, [])

  const fetchFlags = async () => {
    try {
      const response = await fetch('/api/admin/feature-flags')
      const data = await response.json()
      setFlags(data.flags)
    } catch (error) {
      console.error('Error fetching feature flags:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateFlag = async (flagName: string, updates: Partial<FeatureFlag>) => {
    setUpdating(flagName)
    try {
      const response = await fetch('/api/admin/feature-flags', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: flagName, ...updates })
      })

      if (response.ok) {
        await fetchFlags() // Refresh the list
      }
    } catch (error) {
      console.error('Error updating feature flag:', error)
    } finally {
      setUpdating(null)
    }
  }

  const enableMonetization = async () => {
    await updateFlag('monetization_enabled', { isEnabled: true })
  }

  if (loading) {
    return <div>Loading feature flags...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Feature Flags</h2>
          <p className="text-gray-600">Control feature rollout and monetization</p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">Enable Monetization</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Enable Monetization?</AlertDialogTitle>
              <AlertDialogDescription>
                This will activate subscription plans, usage limits, and payment processing. 
                Make sure you have configured Stripe and reviewed your pricing plans before proceeding.
                This action will affect all users immediately.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={enableMonetization}>
                Enable Monetization
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="grid gap-4">
        {flags.map((flag) => (
          <Card key={flag.id} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{flag.name}</CardTitle>
                  <CardDescription>{flag.description}</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={flag.isEnabled ? "default" : "secondary"}>
                    {flag.isEnabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                  <Switch
                    checked={flag.isEnabled}
                    onCheckedChange={(checked) => 
                      updateFlag(flag.name, { isEnabled: checked })
                    }
                    disabled={updating === flag.name}
                  />
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`rollout-${flag.id}`}>Rollout Percentage</Label>
                  <Input
                    id={`rollout-${flag.id}`}
                    type="number"
                    min="0"
                    max="100"
                    value={flag.rolloutPercentage}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0
                      updateFlag(flag.name, { rolloutPercentage: value })
                    }}
                    disabled={updating === flag.name}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Status</Label>
                  <div className="text-sm text-gray-600">
                    {flag.isEnabled ? (
                      flag.rolloutPercentage === 100 ? 
                        'Fully enabled for all users' :
                        `Enabled for ${flag.rolloutPercentage}% of users`
                    ) : (
                      'Disabled for all users'
                    )}
                  </div>
                </div>
              </div>

              {flag.name === 'monetization_enabled' && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                  <h4 className="font-medium text-yellow-800">Monetization Control</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    When enabled, users will be subject to subscription plans and usage limits. 
                    Ensure payment processing is configured before enabling.
                  </p>
                </div>
              )}

              {flag.name === 'usage_limits_enforced' && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <h4 className="font-medium text-blue-800">Usage Limits</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Controls whether subscription plan limits are enforced. 
                    Users exceeding limits will be prompted to upgrade.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// /app/admin/monetization/page.tsx - Monetization dashboard
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface SubscriptionPlan {
  id: string
  name: string
  displayName: string
  description: string
  priceMonthly: number
  priceYearly: number
  maxNewsletters: number
  maxArticlesPerMonth: number
  maxSavedArticles: number
  maxCategories: number
  isActive: boolean
  features: Record<string, boolean>
}

export default function MonetizationPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [revenue, setRevenue] = useState({
    mrr: 0,
    subscribers: 0,
    churnRate: 0,
    avgRevenuePerUser: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [plansResponse, revenueResponse] = await Promise.all([
        fetch('/api/admin/subscription-plans'),
        fetch('/api/admin/revenue-stats')
      ])
      
      const plansData = await plansResponse.json()
      const revenueData = await revenueResponse.json()
      
      setPlans(plansData.plans)
      setRevenue(revenueData.stats)
    } catch (error) {
      console.error('Error fetching monetization data:', error)
    } finally {
      setLoading(false)
    }
  }

  const updatePlan = async (planId: string, updates: Partial<SubscriptionPlan>) => {
    try {
      const response = await fetch('/api/admin/subscription-plans', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: planId, ...updates })
      })

      if (response.ok) {
        await fetchData()
      }
    } catch (error) {
      console.error('Error updating plan:', error)
    }
  }

  if (loading) {
    return <div>Loading monetization data...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Monetization</h2>
        <p className="text-gray-600">Manage subscription plans and revenue</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">MRR</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${revenue.mrr.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  Monthly Recurring Revenue
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Subscribers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{revenue.subscribers}</div>
                <p className="text-xs text-muted-foreground">
                  Active paying subscribers
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{revenue.churnRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">
                  Monthly churn rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">ARPU</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${revenue.avgRevenuePerUser.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  Average Revenue Per User
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="plans" className="space-y-4">
          <div className="grid gap-4">
            {plans.map((plan) => (
              <Card key={plan.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {plan.displayName}
                        <Badge variant={plan.isActive ? "default" : "secondary"}>
                          {plan.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                    </div>
                    <Switch
                      checked={plan.isActive}
                      onCheckedChange={(checked) => 
                        updatePlan(plan.id, { isActive: checked })
                      }
                    />
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>Monthly Price</Label>
                      <Input
                        type="number"
                        value={plan.priceMonthly}
                        onChange={(e) => 
                          updatePlan(plan.id, { priceMonthly: parseFloat(e.target.value) || 0 })
                        }
                        min="0"
                        step="0.01"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Yearly Price</Label>
                      <Input
                        type="number"
                        value={plan.priceYearly}
                        onChange={(e) => 
                          updatePlan(plan.id, { priceYearly: parseFloat(e.target.value) || 0 })
                        }
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Max Newsletters</Label>
                      <Input
                        type="number"
                        value={plan.maxNewsletters === -1 ? '' : plan.maxNewsletters}
                        onChange={(e) => 
                          updatePlan(plan.id, { 
                            maxNewsletters: e.target.value === '' ? -1 : parseInt(e.target.value) || 0 
                          })
                        }
                        placeholder="Unlimited"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Monthly Articles</Label>
                      <Input
                        type="number"
                        value={plan.maxArticlesPerMonth === -1 ? '' : plan.maxArticlesPerMonth}
                        onChange={(e) => 
                          updatePlan(plan.id, { 
                            maxArticlesPerMonth: e.target.value === '' ? -1 : parseInt(e.target.value) || 0 
                          })
                        }
                        placeholder="Unlimited"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={plan.description}
                      onChange={(e) => 
                        updatePlan(plan.id, { description: e.target.value })
                      }
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`ai-summaries-${plan.id}`}
                        checked={plan.features.aiSummariesEnabled}
                        onCheckedChange={(checked) => 
                          updatePlan(plan.id, { 
                            features: { ...plan.features, aiSummariesEnabled: checked }
                          })
                        }
                      />
                      <Label htmlFor={`ai-summaries-${plan.id}`}>AI Summaries</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`ai-thumbnails-${plan.id}`}
                        checked={plan.features.aiThumbnailsEnabled}
                        onCheckedChange={(checked) => 
                          updatePlan(plan.id, { 
                            features: { ...plan.features, aiThumbnailsEnabled: checked }
                          })
                        }
                      />
                      <Label htmlFor={`ai-thumbnails-${plan.id}`}>AI Thumbnails</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`advanced-filtering-${plan.id}`}
                        checked={plan.features.advancedFilteringEnabled}
                        onCheckedChange={(checked) => 
                          updatePlan(plan.id, { 
                            features: { ...plan.features, advancedFilteringEnabled: checked }
                          })
                        }
                      />
                      <Label htmlFor={`advanced-filtering-${plan.id}`}>Advanced Filtering</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`api-access-${plan.id}`}
                        checked={plan.features.apiAccessEnabled}
                        onCheckedChange={(checked) => 
                          updatePlan(plan.id, { 
                            features: { ...plan.features, apiAccessEnabled: checked }
                          })
                        }
                      />
                      <Label htmlFor={`api-access-${plan.id}`}>API Access</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`priority-support-${plan.id}`}
                        checked={plan.features.prioritySupportEnabled}
                        onCheckedChange={(checked) => 
                          updatePlan(plan.id, { 
                            features: { ...plan.features, prioritySupportEnabled: checked }
                          })
                        }
                      />
                      <Label htmlFor={`priority-support-${plan.id}`}>Priority Support</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Settings</CardTitle>
              <CardDescription>Configure payment processing and billing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Stripe Publishable Key</Label>
                <Input 
                  type="password" 
                  placeholder="pk_live_..." 
                  defaultValue={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Stripe Secret Key</Label>
                <Input 
                  type="password" 
                  placeholder="sk_live_..." 
                  defaultValue="••••••••••••••••"
                />
              </div>

              <div className="space-y-2">
                <Label>Stripe Webhook Secret</Label>
                <Input 
                  type="password" 
                  placeholder="whsec_..." 
                  defaultValue="••••••••••••••••"
                />
              </div>

              <Button>Save Payment Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// /app/api/admin/feature-flags/route.ts - Admin API for feature flags
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { prisma } from '@/lib/prisma'
import { FeatureFlag } from '@/lib/feature-flags'

async function isAdmin(email: string): Promise<boolean> {
  const adminEmails = ['admin@yourdomain.com', 'your-email@gmail.com']
  return adminEmails.includes(email)
}

export async function GET() {
  const session = await getServerSession()
  if (!session?.user?.email || !(await isAdmin(session.user.email))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const flags = await prisma.featureFlag.findMany({
    orderBy: { name: 'asc' }
  })

  return NextResponse.json({ flags })
}

export async function PUT(request: NextRequest) {
  const session = await getServerSession()
  if (!session?.user?.email || !(await isAdmin(session.user.email))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { name, isEnabled, rolloutPercentage } = await request.json()

  await FeatureFlag.setFlag(name, isEnabled, rolloutPercentage)

  return NextResponse.json({ success: true })
}

// /app/api/admin/subscription-plans/route.ts - Admin API for subscription plans
export async function GET() {
  const session = await getServerSession()
  if (!session?.user?.email || !(await isAdmin(session.user.email))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const plans = await prisma.subscriptionPlan.findMany({
    orderBy: { sortOrder: 'asc' }
  })

  return NextResponse.json({ plans })
}

export async function PUT(request: NextRequest) {
  const session = await getServerSession()
  if (!session?.user?.email || !(await isAdmin(session.user.email))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id, ...updates } = await request.json()

  const plan = await prisma.subscriptionPlan.update({
    where: { id },
    data: {
      ...updates,
      updatedAt: new Date()
    }
  })

  return NextResponse.json({ plan })
}