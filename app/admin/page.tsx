// app/admin/page.tsx - Missing admin dashboard page
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  Users, 
  Mail, 
  Tag, 
  Settings, 
  Database,
  TrendingUp,
  Activity,
  Eye,
  MessageSquare
} from 'lucide-react';

export default function AdminDashboard() {
  // Mock stats - in real app these would come from your database
  const stats = {
    totalUsers: 1234,
    totalNewsletters: 45,
    totalCategories: 8,
    totalArticles: 2847,
    activeUsers: 892,
    processingQueue: 23
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Manage your newsletter aggregation platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +8% from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCategories}</div>
            <p className="text-xs text-muted-foreground">
              Across all topics
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalArticles.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +2,847 this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Management Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Tag className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Categories</CardTitle>
                <CardDescription>Manage newsletter categories</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Create and organize categories for the landing page. Control which categories are visible to users.
            </p>
            <Link href="/admin/categories">
              <Button className="w-full">
                Manage Categories
                <Eye className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <Mail className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Newsletters</CardTitle>
                <CardDescription>Manage predefined newsletters</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Add and configure predefined newsletters that users can subscribe to automatically.
            </p>
            <Link href="/admin/newsletters">
              <Button variant="outline" className="w-full" disabled>
                Coming Soon
                <Mail className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Users</CardTitle>
                <CardDescription>Manage user accounts</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              View user accounts, manage subscriptions, and handle user support requests.
            </p>
            <Link href="/admin/users">
              <Button variant="outline" className="w-full" disabled>
                Coming Soon
                <Users className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-orange-100 rounded-lg">
                <BarChart3 className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Analytics</CardTitle>
                <CardDescription>Platform usage statistics</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              View detailed analytics on user engagement, newsletter performance, and system health.
            </p>
            <Link href="/admin/analytics">
              <Button variant="outline" className="w-full" disabled>
                Coming Soon
                <TrendingUp className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-red-100 rounded-lg">
                <Database className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <CardTitle className="text-lg">System Health</CardTitle>
                <CardDescription>Monitor system status</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Database status, processing queues, and system performance monitoring.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Database:</span>
                <span className="text-green-600 font-medium">✓ Healthy</span>
              </div>
              <div className="flex justify-between">
                <span>Processing Queue:</span>
                <span className="text-blue-600 font-medium">{stats.processingQueue} pending</span>
              </div>
              <div className="flex justify-between">
                <span>Email Service:</span>
                <span className="text-green-600 font-medium">✓ Active</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Settings className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Settings</CardTitle>
                <CardDescription>Platform configuration</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Configure global settings, feature flags, and system preferences.
            </p>
            <Link href="/admin/settings">
              <Button variant="outline" className="w-full" disabled>
                Coming Soon
                <Settings className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/categories">
            <Button size="sm">
              <Tag className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </Link>
          <Button size="sm" variant="outline" disabled>
            <Mail className="w-4 h-4 mr-2" />
            Add Newsletter
          </Button>
          <Button size="sm" variant="outline" disabled>
            <Users className="w-4 h-4 mr-2" />
            View Users
          </Button>
          <Link href="/">
            <Button size="sm" variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              View Public Site
            </Button>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest system events and user actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium">New user registered</p>
                <p className="text-gray-500">john.doe@example.com • 2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium">Newsletter processed</p>
                <p className="text-gray-500">TechCrunch Daily • 15 minutes ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium">Category updated</p>
                <p className="text-gray-500">Technology category • 1 hour ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium">System maintenance</p>
                <p className="text-gray-500">Database backup completed • 3 hours ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}