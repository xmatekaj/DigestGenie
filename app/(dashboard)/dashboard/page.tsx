// app/dashboard/page.tsx - Full dashboard with @ imports
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mail, Plus, Settings, TrendingUp } from 'lucide-react'

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Header */}
        <div className="border-b pb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome to DigestGenie
          </h1>
          <p className="text-gray-600 mt-2">
            Your AI-powered newsletter aggregator. Manage subscriptions, read summaries, and never miss important content.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                No subscriptions yet
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unread Articles</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                All caught up!
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                New articles processed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Processing</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Ready</div>
              <p className="text-xs text-muted-foreground">
                AI features enabled
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <p className="text-sm text-gray-600">
              Get started with essential setup tasks
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="flex flex-col h-auto py-4 px-3">
                <Mail className="h-6 w-6 mb-2 text-blue-500" />
                <span className="text-sm font-medium">Setup Email</span>
                <span className="text-xs text-gray-500">Generate forwarding email</span>
              </Button>

              <Button variant="outline" className="flex flex-col h-auto py-4 px-3">
                <Plus className="h-6 w-6 mb-2 text-green-500" />
                <span className="text-sm font-medium">Add Newsletter</span>
                <span className="text-xs text-gray-500">Browse & subscribe</span>
              </Button>

              <Button variant="outline" className="flex flex-col h-auto py-4 px-3">
                <Settings className="h-6 w-6 mb-2 text-purple-500" />
                <span className="text-sm font-medium">AI Features</span>
                <span className="text-xs text-gray-500">Configure AI options</span>
              </Button>

              <Button variant="outline" className="flex flex-col h-auto py-4 px-3">
                <TrendingUp className="h-6 w-6 mb-2 text-gray-500" />
                <span className="text-sm font-medium">View Articles</span>
                <span className="text-xs text-gray-500">Read latest content</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}