// app/(dashboard)/page.tsx - Main dashboard page
import { NewsletterDashboard } from '@/components/newsletters/newsletter-dashboard'
import { DashboardStats } from '@/components/dashboard/dashboard-stats'
import { RecentArticles } from '@/components/articles/recent-articles'
import { QuickActions } from '@/components/dashboard/quick-actions'

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="border-b pb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome to DigestGenie
        </h1>
        <p className="text-gray-600 mt-2">
          Your AI-powered newsletter aggregator. Manage subscriptions, read summaries, and never miss important content.
        </p>
      </div>

      {/* Dashboard Stats */}
      <DashboardStats />

      {/* Quick Actions */}
      <QuickActions />

      {/* Recent Articles Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <RecentArticles limit={5} showHeader={true} />
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Subscriptions</span>
                  <Badge variant="secondary">Loading...</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Unread Articles</span>
                  <Badge>Loading...</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">This Week</span>
                  <span className="text-sm font-medium">Loading...</span>
                </div>
                <div className="pt-4 border-t">
                  <Button className="w-full" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Manage Subscriptions
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Newsletter Dashboard */}
      <div className="mt-12">
        <NewsletterDashboard />
      </div>
    </div>
  )
}